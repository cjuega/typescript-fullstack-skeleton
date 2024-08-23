import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDomainEventsFailoverTable1705951467030 implements MigrationInterface {
    private readonly tableName = 'failed_domain_events';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                occurred_on TIMESTAMP(3) NOT NULL,
                payload TEXT NOT NULL
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(this.tableName);
    }
}
