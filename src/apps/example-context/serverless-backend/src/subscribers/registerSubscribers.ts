import { ContainerBuilder, Definition } from 'node-dependency-injection';
import { DomainEventSubscriber } from '@context/shared/domain/eventBus/domainEventSubscriber';
import { DomainEvent } from '@context/shared/domain/eventBus/domainEvent';
import { EventBus } from '@context/shared/domain/eventBus/eventBus';

const registerSubscribers = (container: ContainerBuilder): EventBus => {
    const eventBus = container.get('Shared.InMemoryEventBus'),
        subscriberDefinitions = container.findTaggedServiceIds('domainEventSubscriber') as Map<string, Definition>,
        subscribers: Array<DomainEventSubscriber<DomainEvent>> = [];

    subscriberDefinitions.forEach((_value: any, key: any) => {
        subscribers.push(container.get(key));
    });

    eventBus.addSubscribers(subscribers);

    return eventBus;
};

export default registerSubscribers;
