import DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventName } from '@src/domain/eventBus/domainEventName';
import type { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import ObjectMother from '@src/domain/objectMother.mother';
import InMemoryAsyncEventBus from '@src/infrastructure/eventBus/inMemoryAsyncEventBus';

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

    toPrimitives(): Record<string, unknown> {
        return {};
    }
}

class DomainEventSubscriberDummy implements DomainEventSubscriber<DummyEvent> {
    private expectation: ((actual: DummyEvent) => void) | undefined = undefined;

    name(): string {
        throw new Error('Method not implemented.');
    }

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

describe('inMemoryAsyncEventBus', () => {
    it('throws an error when no subscribers are registered', async () => {
        expect.hasAssertions();

        const event = new DummyEvent({ id: ObjectMother.uuid() }),
            eventBus = new InMemoryAsyncEventBus();

        await expect(eventBus.publish([event])).rejects.toThrow(Error);
    });

    it('the subscriber should be called when the event it is subscribed to is published', async () => {
        expect.assertions(1);

        const event = new DummyEvent({ id: ObjectMother.uuid() }),
            subscriber = new DomainEventSubscriberDummy(),
            eventBus = new InMemoryAsyncEventBus();

        eventBus.registerSubscribers([subscriber]);

        subscriber.setExpectation((actual: DummyEvent) => {
            expect(actual).toStrictEqual(event);
        });

        await eventBus.publish([event]);
    });
});
