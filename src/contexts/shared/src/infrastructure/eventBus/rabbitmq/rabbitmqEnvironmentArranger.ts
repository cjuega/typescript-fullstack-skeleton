import type EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import type RabbitmqConfigurer from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConfigurer';
import type RabbitmqConnection from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConnection';

export default class RabbitmqEnvironmentArranger implements EnvironmentArranger {
    private readonly connection: RabbitmqConnection;

    private readonly configurer: RabbitmqConfigurer;

    private isConfigured = false;

    constructor(connection: RabbitmqConnection, configurer: RabbitmqConfigurer) {
        this.connection = connection;
        this.configurer = configurer;
    }

    async arrange(): Promise<void> {
        await this.configure();
        // TODO: clean up queues
    }

    private async configure(): Promise<void> {
        if (!this.isConfigured) {
            await this.configurer.configure();
            this.isConfigured = true;
        }
    }

    async close(): Promise<void> {
        await this.connection.close();
    }
}
