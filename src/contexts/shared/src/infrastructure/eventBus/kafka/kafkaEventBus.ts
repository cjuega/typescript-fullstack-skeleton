import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import { EventBus } from '@src/domain/eventBus/eventBus';
// import KafkaConfig from '@src/infrastructure/eventBus/kafka/kafkaConfig';
import KafkaDomainEventsMapper from '@src/infrastructure/eventBus/kafka/kafkaDomainEventsMapper';
import {
    Kafka, Message, Producer, TopicMessages
} from 'kafkajs';

export default class KafkaEventBus implements EventBus {
    private readonly producer: Producer;

    private isConnected: boolean = false;

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

        errorTypes.forEach((type) => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            process.on(type, disconnect);
        });

        signalTraps.forEach((type) => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            process.once(type, disconnect);
        });
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
        const eventsPerTopic = events.reduce((map, event) => {
            const topic = this.getTopicFor(event);

            if (!topic) {
                return map;
            }

            if (!map[topic]) {
                // eslint-disable-next-line no-param-reassign
                map[topic] = [];
            }

            map[topic].push({
                value: this.marshaller.marshall(event) as string | Buffer
            });

            return map;
        }, {} as Record<string, Message[]>);

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
