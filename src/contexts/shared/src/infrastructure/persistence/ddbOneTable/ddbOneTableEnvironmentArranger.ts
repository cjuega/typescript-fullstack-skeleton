import EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import { Table } from 'dynamodb-onetable';
import { chunk } from 'lodash';

export default class DdbOneTableEnvironmentArranger extends EnvironmentArranger {
    protected static MAX_BATCH_WRITE_ITEMS = 25;

    private readonly table: Promise<Table>;

    constructor(table: Promise<Table>) {
        super();

        this.table = table;
    }

    async arrange(): Promise<void> {
        await this.ensureDatabaseExists();
        await this.cleanDatabase();
    }

    private async ensureDatabaseExists(): Promise<void> {
        const doesTableExist = await (await this.table).exists();

        if (doesTableExist) {
            return;
        }

        await (await this.table).createTable();
    }

    private async cleanDatabase(): Promise<void> {
        let next;

        do {
            // eslint-disable-next-line no-await-in-loop
            const response = await (await this.table).scanItems();

            // eslint-disable-next-line no-await-in-loop
            await this.deleteItems(response);

            next = response.next;
        } while (next);
    }

    private async deleteItems(items: any[]): Promise<void> {
        await Promise.all(
            chunk(items, DdbOneTableEnvironmentArranger.MAX_BATCH_WRITE_ITEMS).map(async (list) => {
                const batch = {};

                for (const item of list) {
                    // eslint-disable-next-line no-await-in-loop
                    await (await this.table).deleteItem(item, { batch });
                }

                await (await this.table).batchWrite(batch);
            })
        );
    }

    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
    async close(): Promise<void> {}
}
