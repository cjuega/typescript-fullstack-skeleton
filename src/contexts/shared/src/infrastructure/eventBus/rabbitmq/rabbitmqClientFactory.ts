import { Nullable } from '@src/domain/nullable';
import RabbitmqConfig from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConfig';
import RabbitmqConnection from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConnection';

export default class RabbitmqClientFactory {
    private static clients: Record<string, RabbitmqConnection> = {};

    static createClient(contextName: string, config: RabbitmqConfig): RabbitmqConnection {
        let client = RabbitmqClientFactory.getClient(contextName);

        if (!client) {
            client = RabbitmqClientFactory.createAndConnectClient(config);

            RabbitmqClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<RabbitmqConnection> {
        return RabbitmqClientFactory.clients[contextName];
    }

    private static createAndConnectClient(config: RabbitmqConfig): RabbitmqConnection {
        const client = new RabbitmqConnection(config);

        return client;
    }

    private static registerClient(client: RabbitmqConnection, contextName: string): void {
        RabbitmqClientFactory.clients[contextName] = client;
    }
}
