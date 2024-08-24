import CreateExampleAggregateCommandHandler from '@context/example/example-aggregate/application/create/createExampleAggregateCommandHandler';
import ExampleAggregateCreator from '@context/example/example-aggregate/application/create/exampleAggregateCreator';
import DdbOneTableExampleAggregateRepository from '@context/example/example-aggregate/infrastructure/persistence/ddbOneTable/ddbOneTableExampleAggregateRepository';
import { type ContainerBuilder, Reference } from 'node-dependency-injection';

const register = (container: ContainerBuilder): void => {
    container
        .register('<YourBoundedContext>.entities.ExampleAggregateRepository', DdbOneTableExampleAggregateRepository)
        .addArgument(new Reference('Shared.DynamodbTable'))
        .addArgument(new Reference('Shared.DomainEventRepository'));

    container
        .register('<YourBoundedContext>.exampleAggregate.ExampleAggregateCreator', ExampleAggregateCreator)
        .addArgument(new Reference('Shared.Clock'))
        .addArgument(new Reference('<YourBoundedContext>.entities.ExampleAggregateRepository'))
        .addArgument(new Reference('Shared.EventBus'));

    container
        .register('<YourBoundedContext>.exampleAggregate.CreateExampleAggregateCommandHandler', CreateExampleAggregateCommandHandler)
        .addArgument(new Reference('<YourBoundedContext>.exampleAggregate.ExampleAggregateCreator'))
        .addTag('commandHandler');
};

export default register;
