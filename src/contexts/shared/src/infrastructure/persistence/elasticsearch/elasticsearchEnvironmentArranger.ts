import { Client } from '@elastic/elasticsearch';
import EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import ElasticsearchIndexCreator from '@src/infrastructure/persistence/elasticsearch/elasticsearchIndexCreator';

export default class ElasticsearchEnvironmentArranger extends EnvironmentArranger {
    private readonly client: Client;

    private readonly indexCreator: ElasticsearchIndexCreator;

    constructor(client: Client, indexCreator: ElasticsearchIndexCreator) {
        super();

        this.client = client;
        this.indexCreator = indexCreator;
    }

    async arrange(): Promise<void> {
        await this.dropAllIndex();
        await this.createIndices();
    }

    private async dropAllIndex(): Promise<void> {
        const indices = (await this.listAllIndices()).filter((index) => !index.startsWith('.'));

        if (indices.length === 0) {
            return;
        }

        await this.client.indices.delete({
            index: indices
        });
    }

    private async listAllIndices(): Promise<string[]> {
        return (await this.client.cat.indices({ format: 'json' })).filter(({ index }) => !!index).map(({ index }) => index) as string[];
    }

    private async createIndices(): Promise<void> {
        await this.indexCreator.createIndices();
    }

    async close(): Promise<void> {}
}
