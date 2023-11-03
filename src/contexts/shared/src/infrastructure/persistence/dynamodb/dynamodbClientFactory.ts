import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Nullable } from '@src/domain/nullable';
import DynamodbConfig from '@src/infrastructure/persistence/dynamodb/dynamodbConfig';

export default class DynamodbClientFactory {
    private static clients: { [key: string]: DynamoDB } = {};

    static createClient(contextName: string, config: DynamodbConfig): DynamoDB {
        let client = DynamodbClientFactory.getClient(contextName);

        if (!client) {
            client = DynamodbClientFactory.create(config);

            DynamodbClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<DynamoDB> {
        return DynamodbClientFactory.clients[contextName];
    }

    private static create(config: DynamodbConfig): DynamoDB {
        const awsConfig = this.extractClientConfig(config),
            client = new DynamoDB(awsConfig);

        return client;
    }

    private static extractClientConfig(config: DynamodbConfig): DynamoDB.Types.ClientConfiguration | undefined {
        const { region, endpoint, sslEnabled } = config,
            clientConfig = {};

        if (region) {
            Object.assign(clientConfig, { region });
        }

        if (endpoint) {
            Object.assign(clientConfig, { endpoint });
        }

        if (sslEnabled !== undefined) {
            Object.assign(clientConfig, { sslEnabled });
        }

        return Object.keys(clientConfig).length > 0 ? clientConfig : undefined;
    }

    private static registerClient(client: DynamoDB, contextName: string): void {
        DynamodbClientFactory.clients[contextName] = client;
    }
}
