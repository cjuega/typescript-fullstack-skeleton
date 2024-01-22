import EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import RabbitmqConnection from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConnection';

export default class RabbitmqEnvironmentArranger implements EnvironmentArranger {
    private readonly connection: RabbitmqConnection;

    constructor(connection: RabbitmqConnection) {
        this.connection = connection;
    }

    // eslint-disable-next-line class-methods-use-this
    arrange(): Promise<void> {
        // TODO: implement
        return Promise.resolve();
    }

    async close(): Promise<void> {
        await this.connection.close();
    }
}
