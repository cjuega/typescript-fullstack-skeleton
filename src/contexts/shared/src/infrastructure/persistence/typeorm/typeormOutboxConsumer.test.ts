/* eslint-disable max-classes-per-file */
import EventBusMock from '@src/__mocks__/eventBus.mock';
import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import MotherCreator from '@src/domain/motherCreator.mother';
import Repeater from '@src/domain/repeater.mother';
import UuidMother from '@src/domain/uuid.mother';
import DomainEventJsonMarshaller from '@src/infrastructure/eventBus/marshallers/json/domainEventJsonMarshaller';
import NoopLogger from '@src/infrastructure/logger/noopLogger';
import TypeormClientFactory from '@src/infrastructure/persistence/typeorm/typeormClientFactory';
import TypeormDomainEventRepository from '@src/infrastructure/persistence/typeorm/typeormDomainEventRepository';
import TypeormEnvironmentArranger from '@src/infrastructure/persistence/typeorm/typeormEnvironmentArranger';
import TypeormOutboxConsumer from '@src/infrastructure/persistence/typeorm/typeormOutboxConsumer';
import { intersectionBy } from 'lodash';
import { resolve } from 'path';

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
    // eslint-disable-next-line class-methods-use-this
    subscribedTo(): DomainEventName<DummyEvent>[] {
        return [DummyEvent];
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    async on(_event: DummyEvent): Promise<void> {}
}

const noLogger = new NoopLogger(),
    client = TypeormClientFactory.createClient(
        'integration-tests',
        {
            host: 'localhost',
            port: 3307,
            username: 'root',
            password: 'integration-test',
            database: 'database',
            migrations: [resolve(__dirname, '../../../../', 'db/migrations/mysql/*')]
        },
        noLogger
    ),
    environmentArranger = new TypeormEnvironmentArranger(client),
    subscribers = [new DomainEventSubscriberDummy()],
    unmarshaller = new DomainEventJsonMarshaller(new DomainEventMapping(subscribers)),
    repository = new TypeormDomainEventRepository(client, unmarshaller, { tableName: 'failed_domain_events' });

describe('typeormOutboxConsumer', () => {
    let eventBus: EventBusMock;
    let consumer: TypeormOutboxConsumer;

    // eslint-disable-next-line jest/no-hooks
    beforeEach(async () => {
        eventBus = new EventBusMock();
        consumer = new TypeormOutboxConsumer(client, unmarshaller, eventBus, { tableName: 'failed_domain_events' });

        await environmentArranger.arrange();
    });

    // eslint-disable-next-line jest/no-hooks
    afterAll(async () => {
        await environmentArranger.close();
    });

    describe('consume', () => {
        it('should not publish any domain event when there are no events', async () => {
            expect.hasAssertions();

            await consumer.consume(10);

            eventBus.assertNothingPublished();
        });

        it('should publish domain events in the order they occurred', async () => {
            expect.hasAssertions();

            const nEvents = 10,
                events: DomainEvent[] = Repeater.random(
                    () => new DummyEvent({ id: UuidMother.random(), occurredOn: MotherCreator.recentDate() }),
                    nEvents
                ),
                expected = events.sort((a, b) => a.occurredOn.getTime() - b.occurredOn.getTime());

            await repository.save(events);

            await consumer.consume(10);

            eventBus.customAssertion(1, (callsArguments: DomainEvent[][]) => {
                const [actual] = callsArguments;
                expect(actual).toStrictEqual(expected);
            });
        });

        it('should not publish same events concurrently', async () => {
            expect.hasAssertions();

            const nEvents = 100,
                events: DomainEvent[] = Repeater.random(() => new DummyEvent({ id: UuidMother.random() }), nEvents);

            await repository.save(events);

            await Promise.all([consumer.consume(10), consumer.consume(10), consumer.consume(10)]);

            eventBus.customAssertion(3, (callsArguments: DomainEvent[][]) => {
                const [first, second, third] = callsArguments;

                expect(intersectionBy(first, second, third, 'eventId')).toHaveLength(0);
            });
        });

        it('should remove events once they are published', async () => {
            expect.hasAssertions();

            const nEvents = 10,
                events: DomainEvent[] = Repeater.random(() => new DummyEvent({ id: UuidMother.random() }), nEvents);

            await repository.save(events);

            await consumer.consume(nEvents);
            await consumer.consume(nEvents);

            eventBus.assertPublishHasBeenCalledTimes(1);
        });

        it('should not remove events when publishing failed', async () => {
            expect.hasAssertions();

            const nEvents = 10,
                events: DomainEvent[] = Repeater.random(() => new DummyEvent({ id: UuidMother.random() }), nEvents),
                expected = events;

            eventBus.whenPublishThrowFor(events);

            await repository.save(events);

            await consumer.consume(nEvents);
            await consumer.consume(nEvents);

            eventBus.assertPublishHasBeenCalledTimes(2);
            eventBus.customAssertion(1, (callsArguments: DomainEvent[][]) => {
                const [actual] = callsArguments;
                expect(actual).toStrictEqual(expect.arrayContaining(expected));
            });
        });
    });
});
