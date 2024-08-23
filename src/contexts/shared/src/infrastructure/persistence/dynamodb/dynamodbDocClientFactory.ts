import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { Nullable } from '@src/domain/nullable';
import type DynamodbConfig from '@src/infrastructure/persistence/dynamodb/dynamodbConfig';
import { captureAWSv3Client } from 'aws-xray-sdk';

export default class DynamodbDocClientFactory {
    private static clients: Record<string, DynamoDBDocumentClient> = {};

    static createClient(contextName: string, ddbClient: DynamoDBClient, config: DynamodbConfig): DynamoDBDocumentClient {
        let client = DynamodbDocClientFactory.getClient(contextName);

        if (!client) {
            client = DynamodbDocClientFactory.create(ddbClient, config);
            DynamodbDocClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<DynamoDBDocumentClient> {
        return DynamodbDocClientFactory.clients[contextName] || null;
    }

    private static create(ddbClient: DynamoDBClient, config: DynamodbConfig): DynamoDBDocumentClient {
        const client = DynamoDBDocumentClient.from(ddbClient);

        if (config.enableTracing) {
            captureAWSv3Client(client);
        }

        return client;
    }

    private static registerClient(client: DynamoDBDocumentClient, contextName: string): void {
        DynamodbDocClientFactory.clients[contextName] = client;
    }
}
