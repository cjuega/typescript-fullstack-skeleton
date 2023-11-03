import EventBridge from 'aws-sdk/clients/eventbridge';
import { Nullable } from '@src/domain/nullable';
import EventBridgeConfig from '@src/infrastructure/eventBus/eventBridge/eventBridgeConfig';
import { captureAWSClient } from 'aws-xray-sdk';

export default class EventBridgeClientFactory {
    private static clients: { [key: string]: EventBridge } = {};

    static createClient(contextName: string, config: EventBridgeConfig): EventBridge {
        let client = EventBridgeClientFactory.getClient(contextName);

        if (!client) {
            client = EventBridgeClientFactory.create(config);

            EventBridgeClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<EventBridge> {
        return EventBridgeClientFactory.clients[contextName];
    }

    private static create(config: EventBridgeConfig): EventBridge {
        const awsConfig = this.extractClientConfig(config),
            client = new EventBridge(awsConfig);

        if (config.enableTracing) {
            captureAWSClient(client);
        }

        return client;
    }

    private static extractClientConfig(config: EventBridgeConfig): EventBridge.ClientConfiguration | undefined {
        const { region, endpoint } = config,
            clientConfig = {};

        if (region) {
            Object.assign(clientConfig, { region });
        }

        if (endpoint) {
            Object.assign(clientConfig, { endpoint });
        }

        return Object.keys(clientConfig).length > 0 ? clientConfig : undefined;
    }

    private static registerClient(client: EventBridge, contextName: string): void {
        EventBridgeClientFactory.clients[contextName] = client;
    }
}
