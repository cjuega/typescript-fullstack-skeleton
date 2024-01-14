/* eslint-disable no-underscore-dangle */
import AggregateRoot from '@src/domain/aggregateRoot';
import { DataSource, EntitySchema, Repository } from 'typeorm';

export default abstract class TypeormRepository<T extends AggregateRoot> {
    private readonly _dataSource: Promise<DataSource>;

    constructor(dataSource: Promise<DataSource>) {
        this._dataSource = dataSource;
    }

    protected get dataSource(): Promise<DataSource> {
        return this._dataSource;
    }

    protected abstract entitySchema(): EntitySchema<T>;

    protected async repository(): Promise<Repository<T>> {
        return (await this._dataSource).getRepository(this.entitySchema());
    }
}
