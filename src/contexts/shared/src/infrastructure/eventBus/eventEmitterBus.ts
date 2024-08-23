import { EventEmitter } from 'node:events';
import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';

export default class EventEmitterBus extends EventEmitter {
    constructor(subscribers: DomainEventSubscriber<DomainEvent>[]) {
        super();

        this.registerSubscribers(subscribers);
    }

    registerSubscribers(subscribers?: DomainEventSubscriber<DomainEvent>[]): void {
        if (!subscribers) {
            return;
        }

        for (const s of subscribers) {
            this.registerSubscriber(s);
        }
    }

    private registerSubscriber(subscriber: DomainEventSubscriber<DomainEvent>): void {
        for (const event of subscriber.subscribedTo()) {
            this.on(event.eventName, subscriber.on.bind(subscriber));
        }
    }

    publish(events: DomainEvent[]): void {
        events.map((event) => this.emit(event.eventName, event));
    }
}
