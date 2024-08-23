import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExampleAggregateTable1701718801334 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS example_aggregates ('
                + 'id VARCHAR(36) PRIMARY KEY,'
                + 'created_at VARCHAR(24) NOT NULL'
            + ')'
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('example_aggregates');
    }
}
