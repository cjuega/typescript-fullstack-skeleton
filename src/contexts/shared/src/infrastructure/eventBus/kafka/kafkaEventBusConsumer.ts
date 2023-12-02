import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import { EventBusConsumer } from '@src/domain/eventBus/eventBusConsumer';
import KafkaConfig from '@src/infrastructure/eventBus/kafka/kafkaConfig';
import { Consumer, Kafka } from 'kafkajs';
import InMemorySyncEventBus from '@src/infrastructure/eventBus/inMemorySyncEventBus';

export default class KafkaEventBusConsumer implements EventBusConsumer {
    private readonly consumer: Consumer;

    private isConnected: boolean = false;

    private readonly internalBus: InMemorySyncEventBus;

    private readonly removeDisconnectListener: () => void;

    constructor(
        kafka: Kafka,
        subscribers: DomainEventSubscriber<DomainEvent>[],
        private readonly unmarshaller: DomainEventUnmarshaller,
        private readonly config: KafkaConfig
    ) {
        this.internalBus = new InMemorySyncEventBus(subscribers);
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

        errorTypes.forEach((type) => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            process.on(type, disconnect);
        });

        signalTraps.forEach((type) => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            process.once(type, disconnect);
        });
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

                const domainEvent = this.unmarshaller.unmarshall(JSON.parse(message.value.toString()));

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
