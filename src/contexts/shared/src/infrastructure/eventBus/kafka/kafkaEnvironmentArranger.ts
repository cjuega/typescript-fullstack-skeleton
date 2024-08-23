import EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import KafkaConfig from '@src/infrastructure/eventBus/kafka/kafkaConfig';
import { Admin, Kafka } from 'kafkajs';

export default class KafkaEnvironmentArranger implements EnvironmentArranger {
    private readonly config: KafkaConfig;

    private readonly admin: Admin;

    private isConnected: boolean = false;

    private readonly removeDisconnectListener: () => void;

    constructor(client: Kafka, config: KafkaConfig) {
        this.config = config;
        this.admin = client.admin();
        this.removeDisconnectListener = this.admin.on(this.admin.events.DISCONNECT, () => {
            this.isConnected = false;
        });

        this.shutdownSetup();
    }

    private shutdownSetup(): void {
        const errorTypes = ['unhandledRejection', 'uncaughtException'],
            signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'],
            disconnect = async () => {
                if (this.isConnected) {
                    await this.admin.disconnect();
                }
            };

        errorTypes.forEach((type) => {
            process.on(type, disconnect);
        });

        signalTraps.forEach((type) => {
            process.once(type, disconnect);
        });
    }

    async arrange(): Promise<void> {
        await this.connected();
        await this.deleteAllTopics();
        await this.createTopics();
    }

    private async connected(): Promise<void> {
        if (this.isConnected) {
            return;
        }

        await this.admin.connect();
    }

    private async deleteAllTopics(): Promise<void> {
        const topics = this.config.topicsToListen?.map(({ topic }) => topic) ?? [],
            existingTopics = await this.admin.listTopics(),
            toDelete = existingTopics.filter((topic) => topics.includes(topic));

        if (toDelete.length === 0) {
            return;
        }

        await this.admin.deleteTopics({ topics: toDelete });
    }

    private async createTopics(): Promise<void> {
        if (!this.config.topicsToListen || this.config.topicsToListen.length === 0) {
            return;
        }

        await this.admin.createTopics({ topics: this.config.topicsToListen.map(({ topic }) => ({ topic })) });
    }

    async close(): Promise<void> {
        this.removeDisconnectListener();
        await this.admin.disconnect();
        this.isConnected = false;
    }
}
