import { Client } from '@opensearch-project/opensearch';
import EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import OpensearchIndexCreator from '@src/infrastructure/persistence/opensearch/opensearchIndexCreator';

export default class OpensearchEnvironmentArranger extends EnvironmentArranger {
    private readonly client: Client;

    private readonly indexCreator: OpensearchIndexCreator;

    constructor(client: Client, indexCreator: OpensearchIndexCreator) {
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
        const { body }: { body: Array<{ index: string }> } = await this.client.cat.indices({ format: 'json' }),
            indices = body.filter(({ index }) => !!index).map(({ index }) => index);

        return indices;
    }

    private async createIndices(): Promise<void> {
        await this.indexCreator.createIndices();
    }

    async close(): Promise<void> {}
}
