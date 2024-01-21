import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer, AwsSigv4SignerResponse } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { Logger } from '@src/domain/logger';
import { Nullable } from '@src/domain/nullable';
import OpensearchConfig from '@src/infrastructure/persistence/opensearch/opensearchConfig';
import { readFileSync } from 'fs';

export default class OpensearchClientFactory {
    private static clients: Record<string, Client> = {};

    static createClient(contextName: string, config: OpensearchConfig, logger: Logger): Client {
        let client = OpensearchClientFactory.getClient(contextName);

        if (!client) {
            client = OpensearchClientFactory.createAndConnectClient(config, logger);

            OpensearchClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<Client> {
        return OpensearchClientFactory.clients[contextName];
    }

    private static createAndConnectClient(config: OpensearchConfig, logger: Logger): Client {
        const options = {
                node: OpensearchClientFactory.buildUrl(config),
                ...OpensearchClientFactory.buildAWSSigner(config),
                ...(config.caCertificate ? { ssl: { ca: readFileSync(config.caCertificate) } } : undefined)
            },
            client = new Client(options);

        OpensearchClientFactory.setUpLogger(client, logger);

        return client;
    }

    private static buildUrl(config: OpensearchConfig): string {
        const url = new URL(config.url);

        if (!url.username && config.username) {
            url.username = config.username;
        }

        if (!url.password && config.password) {
            url.password = config.password;
        }

        return url.toString();
    }

    private static buildAWSSigner(config: OpensearchConfig): AwsSigv4SignerResponse | undefined {
        if (!config.aws) {
            return undefined;
        }

        return AwsSigv4Signer({
            region: config.aws.region,
            service: config.aws.isAWSServerless ? 'aoss' : 'es',
            getCredentials: () => {
                const credentialsProvider = defaultProvider();
                return credentialsProvider();
            }
        });
    }

    private static setUpLogger(client: Client, logger: Logger): void {
        client.on('request', (err, meta) => {
            if (err) {
                logger.error(JSON.stringify(err));
            }

            logger.debug(JSON.stringify(meta));
        });

        client.on('response', (err, meta) => {
            if (err) {
                logger.error(JSON.stringify(err));
            }

            logger.debug(JSON.stringify(meta));
        });
    }

    private static registerClient(client: Client, contextName: string): void {
        OpensearchClientFactory.clients[contextName] = client;
    }
}
