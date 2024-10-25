import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import type { EventBus } from '@src/domain/eventBus/eventBus';
import EventEmitterBus from '@src/infrastructure/eventBus/eventEmitterBus';

export default class InMemoryAsyncEventBus implements EventBus {
    private bus?: EventEmitterBus;

    registerSubscribers(subscribers: DomainEventSubscriber<DomainEvent>[]): void {
        this.bus = new EventEmitterBus(subscribers);
    }

    publish(events: DomainEvent[]): Promise<void> {
        if (!this.bus) {
            return Promise.reject(new Error('No event subscribers registered'));
        }

        this.bus.publish(events);
        return Promise.resolve();
    }
}
