import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import { EventBus } from '@src/domain/eventBus/eventBus';
import EventEmitterBus from '@src/infrastructure/eventBus/eventEmitterBus';

export default class InMemoryAsyncEventBus implements EventBus {
    private readonly bus: EventEmitterBus;

    constructor(subscribers: DomainEventSubscriber<DomainEvent>[]) {
        this.bus = new EventEmitterBus(subscribers);
    }

    publish(events: DomainEvent[]): Promise<void> {
        this.bus.publish(events);
        return Promise.resolve();
    }
}
