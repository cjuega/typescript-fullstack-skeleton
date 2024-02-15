/* eslint-disable max-classes-per-file */
import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import ObjectMother from '@src/domain/objectMother.mother';
import InMemorySyncEventBus from '@src/infrastructure/eventBus/inMemorySyncEventBus';

class DummyEvent extends DomainEvent {
    static eventName = 'dummy:event';

    constructor(
        args: { id: string } & {
            eventId?: string;
            occurredOn?: Date;
        }
    ) {
        super(DummyEvent.eventName, args.id, args.eventId, args.occurredOn);
    }

    // eslint-disable-next-line class-methods-use-this
    toPrimitives(): Record<string, unknown> {
        return {};
    }
}

class DomainEventSubscriberDummy implements DomainEventSubscriber<DummyEvent> {
    private expectation: ((actual: DummyEvent) => void) | undefined = undefined;

    // eslint-disable-next-line class-methods-use-this
    subscribedTo(): DomainEventName<DummyEvent>[] {
        return [DummyEvent];
    }

    on(actual: DummyEvent): Promise<void> {
        if (this.expectation) {
            this.expectation(actual);
        }
        return Promise.resolve();
    }

    setExpectation(fn: (actual: DummyEvent) => void): void {
        this.expectation = fn;
    }
}

describe('inMemorySyncEventBus', () => {
    it('the subscriber should be called when the event it is subscribed to is published', async () => {
        expect.assertions(1);

        const event = new DummyEvent({ id: ObjectMother.uuid() }),
            subscriber = new DomainEventSubscriberDummy(),
            eventBus = new InMemorySyncEventBus([subscriber]);

        subscriber.setExpectation((actual: DummyEvent) => {
            expect(actual).toStrictEqual(event);
        });

        await eventBus.publish([event]);
    });
});
