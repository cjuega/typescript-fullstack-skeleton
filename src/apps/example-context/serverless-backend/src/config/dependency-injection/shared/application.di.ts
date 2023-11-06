import {
    ContainerBuilder, Definition, Reference, TagReference
} from 'node-dependency-injection';
import CurrentTimeClock from '@context/shared/infrastructure/currentTimeClock';
import ConsoleLogger from '@context/shared/infrastructure/consoleLogger';
import DynamodbClientFactory from '@context/shared/infrastructure/persistence/dynamodb/dynamodbClientFactory';
import DdbOneTableClientFactory from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableClientFactory';
import EventBridgeClientFactory from '@context/shared/infrastructure/eventBus/eventBridge/eventBridgeClientFactory';
import DomainEventMapping from '@context/shared/infrastructure/eventBus/domainEventMapping';
import DomainEventJsonDeserializer from '@context/shared/infrastructure/eventBus/domainEventJsonDeserializer';
import DomainEventJsonMarshaller from '@context/shared/infrastructure/eventBus/domainEventJsonMarshaller';
import EventBridgeEventBus from '@context/shared/infrastructure/eventBus/eventBridge/eventBridgeEventBus';
import InMemorySyncEventBus from '@context/shared/infrastructure/eventBus/inMemorySyncEventBus';
import config from '@src/config/config';

const serviceName = config.get('serviceName'),
    register = (container: ContainerBuilder): void => {
        container.register('Shared.Clock', CurrentTimeClock);

        container.register('Shared.Logger', ConsoleLogger);

        let definition = new Definition();
        definition.args = [serviceName, new Reference('Apps.<YourBoundedContext>.Serverless.DynamodbConfig')];
        definition.setFactory(DynamodbClientFactory, 'createClient');
        container.setDefinition('Shared.DynamodbClient', definition);

        definition = new Definition();
        definition.args = [
            serviceName,
            new Reference('Shared.DynamodbClient'),
            new Reference('Apps.<YourBoundedContext>.Serverless.DdbOneTableConfig')
        ];
        definition.setFactory(DdbOneTableClientFactory, 'createClient');
        container.setDefinition('Shared.DynamodbTable', definition);

        definition = new Definition();
        definition.args = [serviceName, new Reference('Apps.<YourBoundedContext>.Serverless.EventBridgeConfig')];
        definition.setFactory(EventBridgeClientFactory, 'createClient');
        container.setDefinition('Shared.EventBridgeClient', definition);

        container.register('Shared.EventBus.DomainEventMapping', DomainEventMapping).addArgument(new TagReference('domainEventSubscriber'));

        container
            .register('Shared.EventBus.DomainEventJsonDeserializer', DomainEventJsonDeserializer)
            .addArgument(new Reference('Shared.EventBus.DomainEventMapping'));

        container.register('Shared.EventBus.EventMarshaller', DomainEventJsonMarshaller);

        container
            .register('Shared.EventBus', EventBridgeEventBus)
            .addArgument(new Reference('Shared.EventBridgeClient'))
            .addArgument(new Reference('Shared.EventBus.EventMarshaller'))
            .addArgument(new Reference('Apps.<YourBoundedContext>.Serverless.EventBridgeConfig'));

        container.register('Shared.InMemoryEventBus', InMemorySyncEventBus);
    };

export default register;
