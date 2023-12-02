import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import { NewableClass } from '@src/domain/newableClass';

type DomainEventCtor = NewableClass<DomainEvent> & DomainEventName<DomainEvent>;

type Mapping = Map<string, DomainEventCtor>;

export default class DomainEventMapping {
    private mapping: Mapping;

    constructor(subscribers: DomainEventSubscriber<DomainEvent>[]) {
        this.mapping = DomainEventMapping.formatSubscribers(subscribers);
    }

    private static formatSubscribers(subscribers: DomainEventSubscriber<DomainEvent>[]): Mapping {
        const reducer = (map: Map<string, DomainEventCtor>, subscriber: DomainEventSubscriber<DomainEvent>) => {
            subscriber.subscribedTo().forEach((domainEventCtor) => {
                const { eventName } = domainEventCtor;
                map.set(eventName, domainEventCtor as DomainEventCtor);
            });

            return map;
        };

        return subscribers.reduce(reducer, new Map<string, DomainEventCtor>());
    }

    for(name: string): NewableClass<DomainEvent> {
        const domainEventCtor = this.mapping.get(name);

        if (!domainEventCtor) {
            throw new Error(`The Domain Event constructor for ${name} doesn't exist or have no subscribers`);
        }

        return domainEventCtor;
    }
}
