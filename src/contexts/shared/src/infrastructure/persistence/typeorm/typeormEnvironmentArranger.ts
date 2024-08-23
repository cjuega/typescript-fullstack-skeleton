import type EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import type { DataSource } from 'typeorm';

export default class TypeormEnvironmentArranger implements EnvironmentArranger {
    private readonly dataSource: Promise<DataSource>;

    constructor(dataSource: Promise<DataSource>) {
        this.dataSource = dataSource;
    }

    async arrange(): Promise<void> {
        await this.applyMigrations();
        await this.emptyTables();
    }

    private async applyMigrations(): Promise<void> {
        await (await this.dataSource).runMigrations({ transaction: 'all' });
    }

    private async emptyTables(): Promise<void> {
        const TablesToIgnore = ['migrations'],
            queryRunner = (await this.dataSource).createQueryRunner(),
            tables = ((await queryRunner.query('SHOW TABLES')) as Array<{ Tables_in_database: string }>)
                .filter((table: { Tables_in_database: string }) => !TablesToIgnore.includes(table.Tables_in_database))
                .map((table: { Tables_in_database: string }) => table.Tables_in_database);

        for (const table of tables) {
            await queryRunner.query(`TRUNCATE TABLE ${table}`);
        }
    }

    async close(): Promise<void> {
        await (await this.dataSource).destroy();
    }
}
