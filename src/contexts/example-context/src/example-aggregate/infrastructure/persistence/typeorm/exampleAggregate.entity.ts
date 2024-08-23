import Datetime from '@context/shared/domain/datetime';
import ValueObjectTransformer from '@context/shared/infrastructure/persistence/typeorm/valueObjectTransformer';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import { EntitySchema } from 'typeorm';

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
