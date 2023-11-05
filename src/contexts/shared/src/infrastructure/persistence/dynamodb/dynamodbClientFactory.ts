import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk';
import { Nullable } from '@src/domain/nullable';
import DynamodbConfig from '@src/infrastructure/persistence/dynamodb/dynamodbConfig';

export default class DynamodbClientFactory {
    private static clients: Record<string, DynamoDBClient> = {};

    static createClient(contextName: string, config: DynamodbConfig): DynamoDBClient {
        let client = DynamodbClientFactory.getClient(contextName);

        if (!client) {
            client = DynamodbClientFactory.create(config);

            DynamodbClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<DynamoDBClient> {
        return DynamodbClientFactory.clients[contextName];
    }

    private static create(config: DynamodbConfig): DynamoDBClient {
        const awsConfig = this.extractClientConfig(config),
            client = new DynamoDBClient(awsConfig);

        if (config.enableTracing) {
            captureAWSv3Client(client);
        }

        return client;
    }

    private static extractClientConfig(config: DynamodbConfig): DynamoDBClientConfig {
        const { region, endpoint, sslEnabled } = config,
            clientConfig = {};

        if (region) {
            Object.assign(clientConfig, { region });
        }

        if (endpoint) {
            Object.assign(clientConfig, { endpoint });
        }

        if (sslEnabled !== undefined) {
            Object.assign(clientConfig, { tls: sslEnabled });
        }

        return Object.keys(clientConfig).length > 0 ? clientConfig : {};
    }

    private static registerClient(client: DynamoDBClient, contextName: string): void {
        DynamodbClientFactory.clients[contextName] = client;
    }
}
