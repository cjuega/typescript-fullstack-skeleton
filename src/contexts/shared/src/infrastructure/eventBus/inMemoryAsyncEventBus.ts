import { EventBus } from '@src/domain/eventBus/eventBus';
import EventEmitterBus from '@src/infrastructure/eventBus/eventEmitterBus';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import { DomainEvent } from '@src/domain/eventBus/domainEvent';

export default class InMemoryAsyncEventBus implements EventBus {
    private bus: EventEmitterBus;

    constructor(subscribers: Array<DomainEventSubscriber<DomainEvent>>) {
        this.bus = new EventEmitterBus(subscribers);
    }

    async publish(events: DomainEvent[]): Promise<void> {
        this.bus.publish(events);
    }

    addSubscribers(subscribers: Array<DomainEventSubscriber<DomainEvent>>): void {
        this.bus.registerSubscribers(subscribers);
    }
}
