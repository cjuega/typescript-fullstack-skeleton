import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import ObjectMother from '@src/domain/objectMother.mother';
import DomainEventJsonMarshaller from '@src/infrastructure/eventBus/marshallers/json/domainEventJsonMarshaller';
import KafkaClientFactory from '@src/infrastructure/eventBus/kafka/kafkaClientFactory';
import KafkaConfig from '@src/infrastructure/eventBus/kafka/kafkaConfig';
import KafkaDomainEventsMapper from '@src/infrastructure/eventBus/kafka/kafkaDomainEventsMapper';
import KafkaEnvironmentArranger from '@src/infrastructure/eventBus/kafka/kafkaEnvironmentArranger';
import KafkaEventBus from '@src/infrastructure/eventBus/kafka/kafkaEventBus';
import KafkaEventBusConsumer from '@src/infrastructure/eventBus/kafka/kafkaEventBusConsumer';
import { KafkaTopicMapper } from '@src/infrastructure/eventBus/kafka/kafkaTopicMapper';
import NoopLogger from '@src/infrastructure/logger/noopLogger';

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

    setExpectation(fn?: (actual: DummyEvent) => void): void {
        this.expectation = fn;
    }
}

class DummyEventKafkaMapper implements KafkaTopicMapper<DummyEvent> {
    kafkaTopicFor(): DomainEventName<DummyEvent>[] {
        return [DummyEvent];
    }

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
    noLogger = new NoopLogger(),
    client = KafkaClientFactory.createClient('integration-tests', config, noLogger),
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
    beforeAll(async () => {
        await arranger.arrange();
        await eventBusConsumer.start();
        await eventBusConsumer.disconnect();
    }, 15 * 1000);

    beforeEach(async () => {
        await arranger.arrange();
        subscribers[0].setExpectation(undefined);
        await eventBusConsumer.start();
    });

    afterEach(async () => {
        await eventBusConsumer.disconnect();
        await eventBus.disconnect();
    });

    afterAll(async () => {
        await arranger.arrange();
        await arranger.close();
    });

    it('should publish events to kafka', async () => {
        expect.hasAssertions();

        const event = new DummyEvent({ id: ObjectMother.uuid() });

        await eventBus.publish([event]);

        expect(true).toBe(true);
    });

    it('the subscriber should be called when the event it is subscribed to is published', (done) => {
        expect.hasAssertions();

        const event = new DummyEvent({ id: ObjectMother.uuid() });

        subscribers[0].setExpectation((actual: DummyEvent) => {
            expect(actual).toStrictEqual(event);
            done();
        });

        eventBus.publish([event]).catch(() => {
            expect(false).toBe(true);
            done();
        });
    });
});
