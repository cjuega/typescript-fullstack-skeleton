import { Nullable } from '@src/domain/nullable';
import { Kafka, logCreator, logLevel } from 'kafkajs';
import { Logger, LogLevel } from '@src/domain/logger';
import KafkaConfig from '@src/infrastructure/eventBus/kafka/kafkaConfig';

export default class KafkaClientFactory {
    private static clients: Record<string, Kafka> = {};

    static createClient(contextName: string, config: KafkaConfig, logger: Logger): Kafka {
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

    private static create(config: KafkaConfig, logger: Logger): Kafka {
        return new Kafka({ ...config, logCreator: KafkaClientFactory.createKafkaLogger(logger) });
    }

    private static createKafkaLogger(logger: Logger): logCreator {
        return () => ({ level, log }) => {
            const mapping: { [key: string]: LogLevel } = {
                [logLevel.INFO]: 'info',
                [logLevel.DEBUG]: 'debug',
                [logLevel.WARN]: 'warn',
                [logLevel.ERROR]: 'error',
                [logLevel.NOTHING]: 'error'
            },
                method: LogLevel = mapping[level] ?? 'info';

            logger[method](log.message);
        };
    }

    private static registerClient(client: Kafka, contextName: string): void {
        KafkaClientFactory.clients[contextName] = client;
    }
}
