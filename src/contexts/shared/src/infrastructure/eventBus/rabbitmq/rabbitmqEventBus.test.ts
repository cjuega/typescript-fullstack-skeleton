/* eslint-disable max-classes-per-file */
import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import ObjectMother from '@src/domain/objectMother.mother';
import DomainEventJsonMarshaller from '@src/infrastructure/eventBus/marshallers/json/domainEventJsonMarshaller';
import RabbitmqClientFactory from '@src/infrastructure/eventBus/rabbitmq/rabbitmqClientFactory';
import RabbitmqConfig from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConfig';
import RabbitmqEnvironmentArranger from '@src/infrastructure/eventBus/rabbitmq/rabbitmqEnvironmentArranger';
import RabbitmqEventBus from '@src/infrastructure/eventBus/rabbitmq/rabbitmqEventBus';

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
    name(): string {
        return 'execute-action-on-dummy-event';
    }

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

const config: RabbitmqConfig = {
    hostname: 'localhost',
    port: 5672,
    username: 'root',
    password: 'integration-test',
    exchange: ''
},
    connection = RabbitmqClientFactory.createClient('integration-tests', config),
    subscribers = [new DomainEventSubscriberDummy()],
    marshaller = new DomainEventJsonMarshaller(new DomainEventMapping(subscribers)),
    eventBus = new RabbitmqEventBus(connection, marshaller, config),
    arranger = new RabbitmqEnvironmentArranger(connection);

describe('rabbitmqEventBus', () => {
    // eslint-disable-next-line jest/no-hooks
    beforeEach(async () => {
        await arranger.arrange();
        subscribers[0].setExpectation(undefined);
    });

    // eslint-disable-next-line jest/no-hooks
    afterAll(async () => {
        await arranger.arrange();
        await arranger.close();
    });

    it('should publish events to RabbitMQ', async () => {
        expect.hasAssertions();

        const event = new DummyEvent({ id: ObjectMother.uuid() });

        await eventBus.publish([event]);

        expect(true).toBe(true);
    });
});
