import { EventBridgeClient, EventBridgeClientConfig } from '@aws-sdk/client-eventbridge';
import { captureAWSv3Client } from 'aws-xray-sdk';
import { Nullable } from '@src/domain/nullable';
import EventBridgeConfig from '@src/infrastructure/eventBus/eventBridge/eventBridgeConfig';

export default class EventBridgeClientFactory {
    private static clients: Record<string, EventBridgeClient> = {};

    static createClient(contextName: string, config: EventBridgeConfig): EventBridgeClient {
        let client = EventBridgeClientFactory.getClient(contextName);

        if (!client) {
            client = EventBridgeClientFactory.create(config);

            EventBridgeClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<EventBridgeClient> {
        return EventBridgeClientFactory.clients[contextName] || null;
    }

    private static create(config: EventBridgeConfig): EventBridgeClient {
        const awsConfig = this.extractClientConfig(config),
            client = new EventBridgeClient(awsConfig);

        if (config.enableTracing) {
            captureAWSv3Client(client);
        }

        return client;
    }

    private static extractClientConfig(config: EventBridgeConfig): EventBridgeClientConfig {
        const { region, endpoint } = config,
            clientConfig = {};

        if (region) {
            Object.assign(clientConfig, { region });
        }

        if (endpoint) {
            Object.assign(clientConfig, { endpoint });
        }

        return Object.keys(clientConfig).length > 0 ? clientConfig : {};
    }

    private static registerClient(client: EventBridgeClient, contextName: string): void {
        EventBridgeClientFactory.clients[contextName] = client;
    }
}
