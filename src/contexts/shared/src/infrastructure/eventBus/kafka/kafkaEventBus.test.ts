/* eslint-disable max-classes-per-file */
import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import UuidMother from '@src/domain/uuid.mother';
import DomainEventJsonMarshaller from '@src/infrastructure/eventBus/marshallers/json/domainEventJsonMarshaller';
import KafkaClientFactory from '@src/infrastructure/eventBus/kafka/kafkaClientFactory';
import KafkaConfig from '@src/infrastructure/eventBus/kafka/kafkaConfig';
import KafkaDomainEventsMapper from '@src/infrastructure/eventBus/kafka/kafkaDomainEventsMapper';
import KafkaEnvironmentArranger from '@src/infrastructure/eventBus/kafka/kafkaEnvironmentArranger';
import KafkaEventBus from '@src/infrastructure/eventBus/kafka/kafkaEventBus';
import KafkaEventBusConsumer from '@src/infrastructure/eventBus/kafka/kafkaEventBusConsumer';
import { KafkaTopicMapper } from '@src/infrastructure/eventBus/kafka/kafkaTopicMapper';

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

    setExpectation(fn?: (actual: DummyEvent) => void): void {
        this.expectation = fn;
    }
}

class DummyEventKafkaMapper implements KafkaTopicMapper<DummyEvent> {
    // eslint-disable-next-line class-methods-use-this
    kafkaTopicFor(): DomainEventName<DummyEvent>[] {
        return [DummyEvent];
    }

    // eslint-disable-next-line class-methods-use-this
    composeKafkaTopic(): string {
        return 'dummy-event';
    }
}

const config: KafkaConfig = {
    clientId: 'integration-tests-producer',
    brokers: ['localhost:9092'],
    groupId: 'integration-tests-consumer',
    topicsToListen: [{ topic: 'dummy-event' }]
},
    client = KafkaClientFactory.createClient('integration-tests', config),
    mappers = [new DummyEventKafkaMapper()],
    eventsMapper = new KafkaDomainEventsMapper(mappers),
    subscribers = [new DomainEventSubscriberDummy()],
    marshaller = new DomainEventJsonMarshaller(new DomainEventMapping(subscribers)),
    eventBus = new KafkaEventBus(client, eventsMapper, marshaller/* , config */),
    eventBusConsumer = new KafkaEventBusConsumer(client, subscribers, marshaller, config),
    arranger = new KafkaEnvironmentArranger(client, config);

describe('kafkaEventBus', () => {
    // Hacky trick to make sure __consumer_offsets topic is created before starting tests to avoid timeouts in
    // consumer connect that might make tests fail. Note this is only relevant when tests are running right after
    // starting the kafka container (in CI for instance).
    // eslint-disable-next-line jest/no-hooks
    beforeAll(async () => {
        await arranger.arrange();
        await eventBusConsumer.start();
        await eventBusConsumer.disconnect();
    }, 15 * 1000);

    // eslint-disable-next-line jest/no-hooks
    beforeEach(async () => {
        await arranger.arrange();
        subscribers[0].setExpectation(undefined);
        await eventBusConsumer.start();
    });

    // eslint-disable-next-line jest/no-hooks
    afterEach(async () => {
        await eventBusConsumer.disconnect();
        await eventBus.disconnect();
    });

    // eslint-disable-next-line jest/no-hooks
    afterAll(async () => {
        await arranger.arrange();
        await arranger.close();
    });

    it('should publish events to kafka', async () => {
        expect.hasAssertions();

        const event = new DummyEvent({ id: UuidMother.random() });

        await eventBus.publish([event]);

        expect(true).toBe(true);
    });

    // eslint-disable-next-line jest/no-done-callback
    it('the subscriber should be called when the event it is subscribed to is published', (done) => {
        expect.hasAssertions();

        const event = new DummyEvent({ id: UuidMother.random() });

        subscribers[0].setExpectation((actual: DummyEvent) => {
            expect(actual).toStrictEqual(event);
            done();
        });

        eventBus.publish([event]).catch(() => {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(false).toBe(true);
            done();
        });
    });
});
