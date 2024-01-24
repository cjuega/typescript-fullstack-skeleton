import DomainEventRepositoryMock from '@src/__mocks__/domainEventRepository.mock';
import EventBusMock from '@src/__mocks__/eventBus.mock';
import DomainEvent from '@src/domain/eventBus/domainEvent';
import WithFailover from '@src/domain/eventBus/withFailover';
import MotherCreator from '@src/domain/motherCreator.mother';
import Repeater from '@src/domain/repeater.mother';

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

describe('withFailover', () => {
    it('should attempt to publish all events', async () => {
        expect.hasAssertions();

        const decoratedEventBus = new EventBusMock(),
            repository = new DomainEventRepositoryMock(),
            eventBus = new WithFailover(decoratedEventBus, repository),
            events = Repeater.random<DummyEvent>(() => new DummyEvent({ id: MotherCreator.uuid() }), MotherCreator.positiveNumber(20));

        await eventBus.publish(events);

        decoratedEventBus.assertPublishedEventsAre(events);
        repository.assertNothingSaved();
    });

    it('should persist failed events for later retry', async () => {
        expect.hasAssertions();

        const decoratedEventBus = new EventBusMock(),
            repository = new DomainEventRepositoryMock(),
            eventBus = new WithFailover(decoratedEventBus, repository),
            events = Repeater.random<DummyEvent>(() => new DummyEvent({ id: MotherCreator.uuid() }), MotherCreator.positiveNumber(20)),
            failingEvents = events.filter((_, i) => i % 2 === 0);

        decoratedEventBus.whenPublishThrowFor(failingEvents);

        await eventBus.publish(events);

        decoratedEventBus.assertPublishedEventsAre(events);
        repository.assertSaveHasBeenWith(failingEvents);
    });
});
