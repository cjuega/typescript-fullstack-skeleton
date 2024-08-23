import { type MigrationInterface, type QueryRunner, TableIndex } from 'typeorm';

export class IndexOccurredOnInDomainEventsFailoverTable1706038572960 implements MigrationInterface {
    private readonly tableName = 'failed_domain_events';

    private readonly indexedColumn = 'occurred_on';

    private readonly indexName = `IDX_${this.tableName}_${this.indexedColumn}`;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createIndex(
            this.tableName,
            new TableIndex({
                name: this.indexName,
                columnNames: [this.indexedColumn]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.tableName, this.indexName);
    }
}
