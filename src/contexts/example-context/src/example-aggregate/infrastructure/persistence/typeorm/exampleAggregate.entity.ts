// eslint-disable-next-line import/no-extraneous-dependencies
import { EntitySchema } from 'typeorm';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import ValueObjectTransformer from '@context/shared/infrastructure/persistence/typeorm/valueObjectTransformer';
import Datetime from '@context/shared/domain/datetime';

const ExampleAggregateEntity = new EntitySchema<ExampleAggregate>({
    name: 'ExampleAggregate',
    tableName: 'example_aggregates',
    target: ExampleAggregate,
    columns: {
        id: {
            type: String,
            primary: true,
            transformer: ValueObjectTransformer(ExampleAggregateId)
        },
        createdAt: {
            type: String,
            name: 'created_at',
            transformer: ValueObjectTransformer(Datetime)
        }
    }
});

export default ExampleAggregateEntity;
