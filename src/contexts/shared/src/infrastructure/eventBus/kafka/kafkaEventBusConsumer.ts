import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import type { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';
import type { EventBusConsumer } from '@src/domain/eventBus/eventBusConsumer';
import InMemorySyncEventBus from '@src/infrastructure/eventBus/inMemorySyncEventBus';
import type KafkaConfig from '@src/infrastructure/eventBus/kafka/kafkaConfig';
import type { Consumer, Kafka } from 'kafkajs';

export default class KafkaEventBusConsumer implements EventBusConsumer {
    private readonly consumer: Consumer;

    private isConnected = false;

    private readonly internalBus: InMemorySyncEventBus;

    private readonly removeDisconnectListener: () => void;

    constructor(
        kafka: Kafka,
        subscribers: DomainEventSubscriber<DomainEvent>[],
        private readonly unmarshaller: DomainEventUnmarshaller,
        private readonly config: KafkaConfig
    ) {
        this.internalBus = new InMemorySyncEventBus();
        this.internalBus.registerSubscribers(subscribers);
        this.consumer = kafka.consumer({ groupId: this.config.groupId });

        this.removeDisconnectListener = this.consumer.on(this.consumer.events.DISCONNECT, () => {
            this.isConnected = false;
        });

        this.shutdownSetup();
    }

    private shutdownSetup(): void {
        const errorTypes = ['unhandledRejection', 'uncaughtException'],
            signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'],
            disconnect = async () => {
                if (this.isConnected) {
                    await this.consumer.disconnect();
                }
            };

        for (const type of errorTypes) {
            process.on(type, disconnect);
        }

        for (const type of signalTraps) {
            process.once(type, disconnect);
        }
    }

    async start(): Promise<void> {
        const topics: string[] = this.topicsToListen();

        if (topics.length === 0) {
            return;
        }

        await this.connect();
        await this.consumer.subscribe({ topics });
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) {
                    return;
                }

                const domainEvent = this.unmarshaller.unmarshall(message.value);

                await this.internalBus.publish([domainEvent]);
            }
        });
    }

    private topicsToListen(): string[] {
        return this.config.topicsToListen?.map(({ topic }) => topic) ?? [];
    }

    private async connect(): Promise<void> {
        if (!this.isConnected) {
            await this.consumer.connect();
            this.isConnected = true;
        }
    }

    async disconnect(): Promise<void> {
        this.removeDisconnectListener();
        await this.consumer.disconnect();
        this.isConnected = false;
    }
}
