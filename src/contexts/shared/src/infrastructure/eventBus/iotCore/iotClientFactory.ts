import { IoTClient, IoTClientConfig } from '@aws-sdk/client-iot';
import { captureAWSv3Client } from 'aws-xray-sdk';
import { Nullable } from '@src/domain/nullable';
import IotCoreConfig from '@src/infrastructure/eventBus/iotCore/iotCoreConfig';

export default class IotClientFactory {
    private static clients: Record<string, IoTClient> = {};

    static createClient(contextName: string, config: IotCoreConfig): IoTClient {
        let client = IotClientFactory.getClient(contextName);

        if (!client) {
            client = IotClientFactory.create(config);

            IotClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<IoTClient> {
        return IotClientFactory.clients[contextName] || null;
    }

    private static create(config: IotCoreConfig): IoTClient {
        const awsConfig = this.extractClientConfig(config),
            client = new IoTClient(awsConfig);

        if (config.enableTracing) {
            captureAWSv3Client(client);
        }

        return client;
    }

    private static extractClientConfig(config: IotCoreConfig): IoTClientConfig {
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

    private static registerClient(client: IoTClient, contextName: string): void {
        IotClientFactory.clients[contextName] = client;
    }
}
