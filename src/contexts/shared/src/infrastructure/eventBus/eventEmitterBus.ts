import { EventEmitter } from 'events';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import DomainEvent from '@src/domain/eventBus/domainEvent';

export default class EventEmitterBus extends EventEmitter {
    constructor(subscribers: Array<DomainEventSubscriber<DomainEvent>>) {
        super();

        this.registerSubscribers(subscribers);
    }

    registerSubscribers(subscribers?: DomainEventSubscriber<DomainEvent>[]): void {
        subscribers?.forEach((subscriber) => {
            this.registerSubscriber(subscriber);
        });
    }

    private registerSubscriber(subscriber: DomainEventSubscriber<DomainEvent>): void {
        subscriber.subscribedTo().forEach((event) => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.on(event.eventName, subscriber.on.bind(subscriber));
        });
    }

    publish(events: DomainEvent[]): void {
        events.map((event) => this.emit(event.eventName, event));
    }
}
