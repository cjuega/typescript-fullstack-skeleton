import { Client } from '@elastic/elasticsearch';
import fglob from 'fast-glob';
import { IndicesIndexSettings, MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import ElasticsearchConfig from '@src/infrastructure/persistence/elasticsearch/elasticsearchConfig';
import { readFile } from 'fs';
import { promisify } from 'util';
import { basename, extname } from 'path';

type ElasticsearchIndexSetup = {
    name: string;
    settings?: IndicesIndexSettings;
    mappings?: MappingTypeMapping;
};

const readFileAsync = promisify(readFile);

export default class ElasticsearchIndexCreator {
    private readonly client: Client;

    private readonly config: ElasticsearchConfig;

    constructor(client: Client, config: ElasticsearchConfig) {
        this.client = client;
        this.config = config;
    }

    async createIndices(): Promise<void> {
        const indices = await ElasticsearchIndexCreator.loadIndices(this.config.indices);

        for (const index of indices) {
            await this.createIndexIfNotExist(index);
        }
    }

    private static async loadIndices(indices: string | string[]): Promise<ElasticsearchIndexSetup[]> {
        const loadFile = async (file: string): Promise<ElasticsearchIndexSetup> => {
                const indexName = basename(file, extname(file)).split('.')[0],
                    { settings, mappings } = JSON.parse(await readFileAsync(file, 'utf8')) as Omit<ElasticsearchIndexSetup, 'name'>;

                return {
                    name: indexName,
                    settings,
                    mappings
                };
            },
            processGlob = async (expr: string): Promise<ElasticsearchIndexSetup[]> => {
                const files = await fglob(expr, { absolute: true });

                return Promise.all(files.map(loadFile));
            },
            indicesGlobExpressions = Array.isArray(indices) ? indices : [indices];

        return (await Promise.all(indicesGlobExpressions.map(processGlob))).flat();
    }

    private async createIndexIfNotExist({ name, settings, mappings }: ElasticsearchIndexSetup): Promise<void> {
        const doesExist = await this.client.indices.exists({ index: name });

        if (!doesExist) {
            await this.client.indices.create({
                index: name,
                settings,
                mappings
            });
        }
    }
}
