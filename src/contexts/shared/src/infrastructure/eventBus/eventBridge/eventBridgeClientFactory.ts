import { EventBridgeClient, EventBridgeClientConfig } from '@aws-sdk/client-eventbridge';
import { captureAWSv3Client } from 'aws-xray-sdk';
import { Nullable } from '@src/domain/nullable';
import EventBridgeConfig from '@src/infrastructure/eventBus/eventBridge/eventBridgeConfig';
import { Logger } from '@src/domain/logger';

export default class EventBridgeClientFactory {
    private static clients: Record<string, EventBridgeClient> = {};

    static createClient(contextName: string, config: EventBridgeConfig, logger: Logger): EventBridgeClient {
        let client = EventBridgeClientFactory.getClient(contextName);

        if (!client) {
            client = EventBridgeClientFactory.create(config, logger);

            EventBridgeClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<EventBridgeClient> {
        return EventBridgeClientFactory.clients[contextName] || null;
    }

    private static create(config: EventBridgeConfig, logger: Logger): EventBridgeClient {
        const awsConfig = this.extractClientConfig(config, logger),
            client = new EventBridgeClient(awsConfig);

        if (config.enableTracing) {
            captureAWSv3Client(client);
        }

        return client;
    }

    private static extractClientConfig(config: EventBridgeConfig, logger: Logger): EventBridgeClientConfig {
        const { region, endpoint } = config,
            clientConfig = {
                logger
            };

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
