import { Nullable } from '@src/domain/nullable';
import { Kafka, logCreator, logLevel } from 'kafkajs';
import { Logger, LogLevel } from '@src/domain/logger';
import KafkaConfig from '@src/infrastructure/eventBus/kafka/kafkaConfig';

export default class KafkaClientFactory {
    private static clients: Record<string, Kafka> = {};

    static createClient(contextName: string, config: KafkaConfig, logger?: Logger): Kafka {
        let client = KafkaClientFactory.getClient(contextName);

        if (!client) {
            client = KafkaClientFactory.create(config, logger);

            KafkaClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<Kafka> {
        return KafkaClientFactory.clients[contextName] || null;
    }

    private static create(config: KafkaConfig, logger?: Logger): Kafka {
        return new Kafka({ ...config, logCreator: KafkaClientFactory.createKafkaLogger(logger) });
    }

    private static createKafkaLogger(logger?: Logger): logCreator | undefined {
        if (!logger) {
            return undefined;
        }

        return () => ({ level, log }) => {
            let method: LogLevel;

            switch (level) {
            case logLevel.ERROR:
            case logLevel.NOTHING:
                method = 'error';
                break;
            case logLevel.WARN:
                method = 'warn';
                break;
            case logLevel.DEBUG:
                method = 'debug';
                break;
            default:
                method = 'info';
                break;
            }

            logger[method](log.message);
        };
    }

    private static registerClient(client: Kafka, contextName: string): void {
        KafkaClientFactory.clients[contextName] = client;
    }
}
