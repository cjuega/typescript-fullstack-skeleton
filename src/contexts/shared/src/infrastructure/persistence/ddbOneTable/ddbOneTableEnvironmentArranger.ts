import EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import { Table, OneProperties } from 'dynamodb-onetable';
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
            const response = await (await this.table).scanItems(undefined, { parse: true, hidden: true });

            await this.deleteItems(response);

            next = response.next;
        } while (next);
    }

    private async deleteItems(items: OneProperties[]): Promise<void> {
        await Promise.all(
            chunk(items, DdbOneTableEnvironmentArranger.MAX_BATCH_WRITE_ITEMS).map(async (list) => {
                const batch = {};

                for (const item of list) {
                    await (await this.table).deleteItem(item, { batch });
                }

                await (await this.table).batchWrite(batch);
            })
        );
    }

    async close(): Promise<void> {}
}
