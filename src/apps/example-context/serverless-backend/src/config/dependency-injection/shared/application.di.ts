import DomainEventMapping from '@context/shared/domain/eventBus/domainEventMapping';
import CommandHandlersInformation from '@context/shared/infrastructure/commandBus/commandHandlersInformation';
import InMemoryCommandBus from '@context/shared/infrastructure/commandBus/inMemoryCommandBus';
import CurrentTimeClock from '@context/shared/infrastructure/currentTimeClock';
import EventBridgeClientFactory from '@context/shared/infrastructure/eventBus/eventBridge/eventBridgeClientFactory';
import EventBridgeEventBus from '@context/shared/infrastructure/eventBus/eventBridge/eventBridgeEventBus';
import InMemorySyncEventBus from '@context/shared/infrastructure/eventBus/inMemorySyncEventBus';
import DomainEventJsonMarshaller from '@context/shared/infrastructure/eventBus/marshallers/json/domainEventJsonMarshaller';
import ConsoleLogger from '@context/shared/infrastructure/logger/consoleLogger';
import DdbOneTableClientFactory from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableClientFactory';
import DdbOneTableDomainEventRepository from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableDomainEventRepository';
import DynamodbClientFactory from '@context/shared/infrastructure/persistence/dynamodb/dynamodbClientFactory';
import DynamodbStreamsOutboxConsumer from '@context/shared/infrastructure/persistence/dynamodb/dynamodbStreamsOutboxConsumer';
import InMemoryQueryBus from '@context/shared/infrastructure/queryBus/inMemoryQueryBus';
import QueryHandlersInformation from '@context/shared/infrastructure/queryBus/queryHandlersInformation';
import config from '@src/config/config';
import { type ContainerBuilder, Definition, Reference, TagReference } from 'node-dependency-injection';

const serviceName = config.get('serviceName'),
    failoverOrOutboxConfig = {
        partitionPrefix: 'outboxEvents'
    },
    register = (container: ContainerBuilder): void => {
        container.register('Shared.Clock', CurrentTimeClock);

        container.register('Shared.Logger', ConsoleLogger);

        let definition = new Definition();
        definition.args = [
            serviceName,
            new Reference('Apps.<YourBoundedContext>.Serverless.DynamodbConfig'),
            new Reference('Shared.Logger')
        ];
        definition.setFactory(DynamodbClientFactory, 'createClient');
        container.setDefinition('Shared.DynamodbClient', definition);

        definition = new Definition();
        definition.args = [
            serviceName,
            new Reference('Shared.DynamodbClient'),
            new Reference('Apps.<YourBoundedContext>.Serverless.DdbOneTableConfig'),
            new Reference('Shared.Logger')
        ];
        definition.setFactory(DdbOneTableClientFactory, 'createClient');
        container.setDefinition('Shared.DynamodbTable', definition);

        definition = new Definition();
        definition.args = [
            serviceName,
            new Reference('Apps.<YourBoundedContext>.Serverless.EventBridgeConfig'),
            new Reference('Shared.Logger')
        ];
        definition.setFactory(EventBridgeClientFactory, 'createClient');
        container.setDefinition('Shared.EventBridgeClient', definition);

        container.register('Shared.EventBus.DomainEventMapping', DomainEventMapping).addArgument(new TagReference('domainEventSubscriber'));

        container
            .register('Shared.EventBus.EventMarshaller', DomainEventJsonMarshaller)
            .addArgument(new Reference('Shared.EventBus.DomainEventMapping'));

        container
            // TODO: Uncomment this to use the failover pattern instead of outbox pattern (and comment the line below)
            //     .register('Shared.EventBus.NoFailover', EventBridgeEventBus)
            .register('Shared.EventBus', EventBridgeEventBus)
            .addArgument(new Reference('Shared.EventBridgeClient'))
            .addArgument(new Reference('Shared.EventBus.EventMarshaller'))
            .addArgument(new Reference('Apps.<YourBoundedContext>.Serverless.EventBridgeConfig'));

        container.register('Shared.InMemoryEventBus', InMemorySyncEventBus);

        container
            .register('Shared.DomainEventRepository', DdbOneTableDomainEventRepository)
            .addArgument(new Reference('Shared.DynamodbTable'))
            .addArgument(new Reference('Shared.EventBus.EventMarshaller'))
            .addArgument(failoverOrOutboxConfig);

        // TODO: Uncomment this to use the failover pattern instead of outbox pattern
        // container
        //     .register('Shared.EventBus', WithFailover)
        //     .addArgument(new Reference('Shared.EventBus.NoFailover'))
        //     .addArgument(new Reference('Shared.DomainEventRepository'));

        container
            .register('Shared.DynamodbOutboxConsumer', DynamodbStreamsOutboxConsumer)
            .addArgument(new Reference('Shared.EventBus.EventMarshaller'))
            .addArgument(new Reference('Shared.EventBus'))
            // TODO: Uncomment this to use the failover pattern instead of outbox pattern (and comment the line above)
            // .addArgument(new Reference('Shared.EventBus.NoFailover'))
            .addArgument(failoverOrOutboxConfig)
            .addTag('dynamodbStreamProcessor');

        container.register('Shared.QueryHandlersInformation', QueryHandlersInformation).addArgument(new TagReference('queryHandler'));
        container.register('Shared.QueryBus', InMemoryQueryBus);

        container.register('Shared.CommandHandlersInformation', CommandHandlersInformation).addArgument(new TagReference('commandHandler'));
        container.register('Shared.CommandBus', InMemoryCommandBus);
    };

export default register;
