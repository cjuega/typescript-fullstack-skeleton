import { Nullable } from '@src/domain/nullable';
import Iot from 'aws-sdk/clients/iot';
import { captureAWSClient } from 'aws-xray-sdk';
import IotCoreConfig from '@src/infrastructure/eventBus/iotCore/iotCoreConfig';

export default class IotClientFactory {
    private static clients: { [key: string]: Iot } = {};

    static createClient(contextName: string, config: IotCoreConfig): Iot {
        let client = IotClientFactory.getClient(contextName);

        if (!client) {
            client = IotClientFactory.create(config);

            IotClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<Iot> {
        return IotClientFactory.clients[contextName];
    }

    private static create(config: IotCoreConfig): Iot {
        const awsConfig = this.extractClientConfig(config),
            client = new Iot(awsConfig);

        if (config.enableTracing) {
            captureAWSClient(client);
        }

        return client;
    }

    private static extractClientConfig(config: IotCoreConfig): Iot.ClientConfiguration | undefined {
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

    private static registerClient(client: Iot, contextName: string): void {
        IotClientFactory.clients[contextName] = client;
    }
}
