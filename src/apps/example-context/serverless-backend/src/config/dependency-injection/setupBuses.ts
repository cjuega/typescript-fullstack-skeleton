import type DomainEvent from '@context/shared/domain/eventBus/domainEvent';
import type { DomainEventSubscriber } from '@context/shared/domain/eventBus/domainEventSubscriber';
import type CommandHandlersInformation from '@context/shared/infrastructure/commandBus/commandHandlersInformation';
import type InMemoryCommandBus from '@context/shared/infrastructure/commandBus/inMemoryCommandBus';
import type InMemorySyncEventBus from '@context/shared/infrastructure/eventBus/inMemorySyncEventBus';
import type InMemoryQueryBus from '@context/shared/infrastructure/queryBus/inMemoryQueryBus';
import type QueryHandlersInformation from '@context/shared/infrastructure/queryBus/queryHandlersInformation';
import type { ContainerBuilder } from 'node-dependency-injection';

function setupInMemoryCommandBus(container: ContainerBuilder): void {
    const mapping = container.get<CommandHandlersInformation>('Shared.CommandHandlersInformation'),
        commandBus = container.get<InMemoryCommandBus>('Shared.CommandBus');

    commandBus.registerHandlers(mapping);
}

function setupInMemoryQueryBus(container: ContainerBuilder): void {
    const mapping = container.get<QueryHandlersInformation>('Shared.QueryHandlersInformation'),
        queryBus = container.get<InMemoryQueryBus>('Shared.QueryBus');

    queryBus.registerHandlers(mapping);
}

function setupInMemoryEventBus(container: ContainerBuilder): void {
    const subscriberDefinitions = container.findTaggedServiceIds('eventSubscriber'),
        eventBus = container.get<InMemorySyncEventBus>('Shared.InMemoryEventBus'),
        subscribers: DomainEventSubscriber<DomainEvent>[] = [];

    for (const { id } of subscriberDefinitions) {
        subscribers.push(container.get(id));
    }

    eventBus.registerSubscribers(subscribers);
}

// This functions help to break circular dependencies in the DI container. Instead of injecting the mappings directly into the buses'
// constructors (which would attempt to instanciate handlers and would lead to a circular dependency), we register handlers and
// subscribers after the buses have been created.
export default function setupBuses(container: ContainerBuilder): void {
    setupInMemoryCommandBus(container);
    setupInMemoryQueryBus(container);
    setupInMemoryEventBus(container);
}
