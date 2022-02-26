/* eslint-disable jest/no-done-callback */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { DomainEvent } from '@src/domain/eventBus/domainEvent';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import InMemoryAsyncEventBus from '@src/infrastructure/eventBus/inMemoryAsyncEventBus';
import { randomBytes } from 'crypto';

class DummyEvent extends DomainEvent {
    static EVENT_NAME = 'dummy:event';

    constructor(id: string) {
        super(DummyEvent.EVENT_NAME, id);
    }

    toPrimitives(): Record<string, any> {
        throw new Error('Method not implemented.');
    }
}

class DomainEventSubscriberDummy implements DomainEventSubscriber<DummyEvent> {
    subscribedTo(): any[] {
        return [DummyEvent];
    }

    on(domainEvent: DummyEvent): void {
        console.log(domainEvent);
    }
}

describe('inMemoryAsyncEventBus', () => {
    let subscriber: DomainEventSubscriberDummy;
    let eventBus: InMemoryAsyncEventBus;

    it('the subscriber should be called when the event it is subscribed to is published', (done) => {
        expect.assertions(1);

        const event = new DummyEvent(randomBytes(20).toString('hex'));

        subscriber = new DomainEventSubscriberDummy();

        subscriber.on = (): void => {
            expect(true).toBe(true);
            done();
        };

        eventBus = new InMemoryAsyncEventBus([subscriber]);

        eventBus.publish([event]);
    });
});
