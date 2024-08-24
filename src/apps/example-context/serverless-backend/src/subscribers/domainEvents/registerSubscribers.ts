import type DomainEvent from '@context/shared/domain/eventBus/domainEvent';
import type { DomainEventSubscriber } from '@context/shared/domain/eventBus/domainEventSubscriber';
import type { EventBus } from '@context/shared/domain/eventBus/eventBus';
import type { ContainerBuilder, Definition } from 'node-dependency-injection';

const registerSubscribers = (container: ContainerBuilder): EventBus => {
    const eventBus = container.get('Shared.InMemoryEventBus'),
        subscriberDefinitions = container.findTaggedServiceIds('domainEventSubscriber') as Map<string, Definition>,
        subscribers: DomainEventSubscriber<DomainEvent>[] = [];

    subscriberDefinitions.forEach((_: Definition, key: string) => {
        subscribers.push(container.get(key));
    });

    eventBus.addSubscribers(subscribers);

    return eventBus;
};

export default registerSubscribers;
