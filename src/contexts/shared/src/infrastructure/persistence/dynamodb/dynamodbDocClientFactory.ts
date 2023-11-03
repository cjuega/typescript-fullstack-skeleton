import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { captureAWSClient } from 'aws-xray-sdk';
import { Nullable } from '@src/domain/nullable';
import DynamodbConfig from '@src/infrastructure/persistence/dynamodb/dynamodbConfig';

type DynamoDbClientOptions = (DocumentClient.DocumentClientOptions & DynamoDB.Types.ClientConfiguration) | undefined;

export default class DynamodbDocClientFactory {
    private static clients: { [key: string]: DynamoDB.DocumentClient } = {};

    static createClient(contextName: string, config: DynamodbConfig): DynamoDB.DocumentClient {
        let client = DynamodbDocClientFactory.getClient(contextName);

        if (!client) {
            client = DynamodbDocClientFactory.create(config);

            DynamodbDocClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<DynamoDB.DocumentClient> {
        return DynamodbDocClientFactory.clients[contextName];
    }

    private static create(config: DynamodbConfig): DynamoDB.DocumentClient {
        const awsConfig = this.extractClientConfig(config),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            client: any = new DynamoDB.DocumentClient(awsConfig);

        if (config.enableTracing) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            captureAWSClient(client.service);
        }

        return client as DynamoDB.DocumentClient;
    }

    private static extractClientConfig(config: DynamodbConfig): DynamoDbClientOptions {
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

    private static registerClient(client: DynamoDB.DocumentClient, contextName: string): void {
        DynamodbDocClientFactory.clients[contextName] = client;
    }
}
