import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import type { EventBus } from '@src/domain/eventBus/eventBus';
import type KafkaDomainEventsMapper from '@src/infrastructure/eventBus/kafka/kafkaDomainEventsMapper';
import type { Kafka, Message, Producer, TopicMessages } from 'kafkajs';

export default class KafkaEventBus implements EventBus {
    private readonly producer: Producer;

    private isConnected = false;

    private readonly removeDisconnectListener: () => void;

    constructor(
        kafka: Kafka,
        private readonly eventsMapper: KafkaDomainEventsMapper,
        private readonly marshaller: DomainEventMarshaller
        // private readonly config: KafkaConfig
    ) {
        this.producer = kafka.producer();

        this.removeDisconnectListener = this.producer.on(this.producer.events.DISCONNECT, () => {
            this.isConnected = false;
        });

        this.shutdownSetup();
    }

    private shutdownSetup(): void {
        const errorTypes = ['unhandledRejection', 'uncaughtException'],
            signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'],
            disconnect = async () => {
                if (this.isConnected) {
                    await this.producer.disconnect();
                }
            };

        for (const type of errorTypes) {
            process.on(type, disconnect);
        }

        for (const type of signalTraps) {
            process.once(type, disconnect);
        }
    }

    async publish(events: DomainEvent[]): Promise<void> {
        await this.connect();

        const messages = this.composeKafkaMessages(events),
            batch = {
                topicMessages: messages
            };

        await this.producer.sendBatch(batch);
    }

    private async connect(): Promise<void> {
        if (!this.isConnected) {
            await this.producer.connect();
            this.isConnected = true;
        }
    }

    private composeKafkaMessages(events: DomainEvent[]): TopicMessages[] {
        const eventsPerTopic = events.reduce(
            (map, event) => {
                const topic = this.getTopicFor(event);

                if (!topic) {
                    return map;
                }

                if (!map[topic]) {
                    map[topic] = [];
                }

                map[topic].push({
                    value: this.marshaller.marshall(event) as string | Buffer
                });

                return map;
            },
            {} as Record<string, Message[]>
        );

        return Object.entries(eventsPerTopic).map(([topic, messages]) => ({ topic, messages }));
    }

    private getTopicFor(event: DomainEvent): string | undefined {
        return this.eventsMapper.composeKafkaTopic(event);
    }

    async disconnect(): Promise<void> {
        this.removeDisconnectListener();
        await this.producer.disconnect();
        this.isConnected = false;
    }
}
