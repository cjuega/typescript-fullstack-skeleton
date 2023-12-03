import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk';
import { Nullable } from '@src/domain/nullable';
import DynamodbConfig from '@src/infrastructure/persistence/dynamodb/dynamodbConfig';
import { Logger } from '@src/domain/logger';

export default class DynamodbClientFactory {
    private static clients: Record<string, DynamoDBClient> = {};

    static createClient(contextName: string, config: DynamodbConfig, logger: Logger): DynamoDBClient {
        let client = DynamodbClientFactory.getClient(contextName);

        if (!client) {
            client = DynamodbClientFactory.create(config, logger);

            DynamodbClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<DynamoDBClient> {
        return DynamodbClientFactory.clients[contextName];
    }

    private static create(config: DynamodbConfig, logger: Logger): DynamoDBClient {
        const awsConfig = this.extractClientConfig(config, logger),
            client = new DynamoDBClient(awsConfig);

        if (config.enableTracing) {
            captureAWSv3Client(client);
        }

        return client;
    }

    private static extractClientConfig(config: DynamodbConfig, logger: Logger): DynamoDBClientConfig {
        const { region, endpoint, sslEnabled } = config,
            clientConfig = {
                logger
            };

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
