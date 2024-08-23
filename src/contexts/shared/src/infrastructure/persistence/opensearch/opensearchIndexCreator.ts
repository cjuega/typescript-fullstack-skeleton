import { Client } from '@opensearch-project/opensearch';
import fglob from 'fast-glob';
import OpensearchConfig from '@src/infrastructure/persistence/opensearch/opensearchConfig';
import { readFile } from 'fs';
import { promisify } from 'util';
import { basename, extname } from 'path';

type OpensearchIndexSetup = {
    name: string;
    setup?: Record<string, unknown>;
};

const readFileAsync = promisify(readFile);

export default class OpensearchIndexCreator {
    private readonly client: Client;

    private readonly config: OpensearchConfig;

    constructor(client: Client, config: OpensearchConfig) {
        this.client = client;
        this.config = config;
    }

    async createIndices(): Promise<void> {
        const indices = await OpensearchIndexCreator.loadIndices(this.config.indices);

        for (const index of indices) {
            await this.createIndexIfNotExist(index);
        }
    }

    private static async loadIndices(indices: string | string[]): Promise<OpensearchIndexSetup[]> {
        const loadFile = async (file: string): Promise<OpensearchIndexSetup> => {
                const indexName = basename(file, extname(file)).split('.')[0],
                    setup = JSON.parse(await readFileAsync(file, 'utf8')) as Omit<OpensearchIndexSetup, 'name'>;

                return {
                    name: indexName,
                    setup
                };
            },
            processGlob = async (expr: string): Promise<OpensearchIndexSetup[]> => {
                const files = await fglob(expr, { absolute: true });

                return Promise.all(files.map(loadFile));
            },
            indicesGlobExpressions = Array.isArray(indices) ? indices : [indices];

        return (await Promise.all(indicesGlobExpressions.map(processGlob))).flat();
    }

    private async createIndexIfNotExist({ name, setup }: OpensearchIndexSetup): Promise<void> {
        const doesExist = await this.client.indices.exists({ index: name });

        if (!doesExist) {
            await this.client.indices.create({
                index: name,
                body: setup
            });
        }
    }
}
