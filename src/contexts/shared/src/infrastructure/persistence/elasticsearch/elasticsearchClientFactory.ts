import { Client, ClientOptions, events } from '@elastic/elasticsearch';
import { Logger } from '@src/domain/logger';
import { Nullable } from '@src/domain/nullable';
import ElasticsearchConfig from '@src/infrastructure/persistence/elasticsearch/elasticsearchConfig';
import { readFileSync } from 'fs';

export default class ElasticsearchClientFactory {
    private static clients: Record<string, Client> = {};

    static createClient(contextName: string, config: ElasticsearchConfig, logger: Logger): Client {
        let client = ElasticsearchClientFactory.getClient(contextName);

        if (!client) {
            client = ElasticsearchClientFactory.createAndConnectClient(config, logger);

            ElasticsearchClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<Client> {
        return ElasticsearchClientFactory.clients[contextName];
    }

    private static createAndConnectClient(config: ElasticsearchConfig, logger: Logger): Client {
        const options: ClientOptions = {
            node: config.url,
            auth: {
                username: config.username,
                password: config.password
            },
            ...(config.caCertificate ? { tls: { ca: readFileSync(config.caCertificate) } } : undefined)
        },
            client = new Client(options);

        ElasticsearchClientFactory.setUpLogger(client, logger);

        return client;
    }

    private static setUpLogger(client: Client, logger: Logger): void {
        client.diagnostic.on(events.REQUEST, (err, meta) => {
            if (err) {
                logger.error(JSON.stringify(err));
            }

            logger.debug(JSON.stringify(meta));
        });

        client.diagnostic.on(events.RESPONSE, (err, meta) => {
            if (err) {
                logger.error(JSON.stringify(err));
            }

            logger.debug(JSON.stringify(meta));
        });
    }

    private static registerClient(client: Client, contextName: string): void {
        ElasticsearchClientFactory.clients[contextName] = client;
    }
}
