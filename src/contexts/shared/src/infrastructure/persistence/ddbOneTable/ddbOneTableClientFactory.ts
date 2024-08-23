import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Nullable } from '@src/domain/nullable';
import { Table, OneModel } from 'dynamodb-onetable';
import Dynamo from 'dynamodb-onetable/Dynamo';
import DdbOneTableConfig from '@src/infrastructure/persistence/ddbOneTable/ddbOneTableConfig';
import fglob from 'fast-glob';
import { basename, extname } from 'path';
import { LogLevel, Logger } from '@src/domain/logger';

type DdbOneTableLoggerFn = (level: string, message: string, context: Record<string, unknown>) => void;

export default class DdbOneTableClientFactory {
    private static clients: Record<string, Table> = {};

    static async createClient(contextName: string, ddbClient: DynamoDBClient, config: DdbOneTableConfig, logger: Logger): Promise<Table> {
        let client = DdbOneTableClientFactory.getClient(contextName);

        if (!client) {
            client = await DdbOneTableClientFactory.create(ddbClient, config, logger);

            DdbOneTableClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<Table> {
        return DdbOneTableClientFactory.clients[contextName];
    }

    private static async create(ddbClient: DynamoDBClient, config: DdbOneTableConfig, logger: Logger): Promise<Table> {
        return new Table({
            name: config.tableName,
            client: new Dynamo({ client: ddbClient }),
            schema: {
                format: 'onetable:1.1.0',
                version: '0.0.1',
                indexes: config.indexes,
                models: await DdbOneTableClientFactory.loadModels(config),
                params: {
                    isoDates: config.isoDates
                }
            },
            partial: true,
            logger: DdbOneTableClientFactory.createDdbOneTableLogger(logger)
        });
    }

    private static async loadModels(config: DdbOneTableConfig): Promise<{ [key: string]: OneModel }> {
        const models: { [key: string]: OneModel } = {},
            modelFiles = await fglob(config.models || '**/ddbOneTable/*.model.{ts,js}', { absolute: true });

        for (const filepath of modelFiles) {
            const modelFile = basename(filepath, extname(filepath)).split('.')[0],
                modelName = modelFile.charAt(0).toLocaleUpperCase() + modelFile.slice(1),
                { default: model } = await import(filepath);

            models[modelName] = model as OneModel;
        }

        return models;
    }

    private static createDdbOneTableLogger(logger: Logger): DdbOneTableLoggerFn {
        return (level: string, message: string): void => {
            const mapping: { [key: string]: LogLevel } = {
                info: 'info',
                trace: 'debug',
                data: 'debug',
                warn: 'warn',
                error: 'error',
                exception: 'error'
            },
                method: LogLevel = mapping[level] ?? 'info';

            logger[method](message);
        };
    }

    private static registerClient(client: Table, contextName: string): void {
        DdbOneTableClientFactory.clients[contextName] = client;
    }
}
