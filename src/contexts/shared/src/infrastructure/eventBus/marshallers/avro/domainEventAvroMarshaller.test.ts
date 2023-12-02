/* eslint-disable max-classes-per-file */
import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import UuidMother from '@src/domain/uuid.mother';
import DomainEventAvroMapping, { DomainEventAvroPathPair } from '@src/infrastructure/eventBus/marshallers/avro/domainEventAvroMapping';
import DomainEventAvroMarshaller from '@src/infrastructure/eventBus/marshallers/avro/domainEventAvroMarshaller';
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

class DummyEventAvroPath implements DomainEventAvroPathPair<DummyEvent> {
    // eslint-disable-next-line class-methods-use-this
    schemaFor(): DomainEventName<DummyEvent> {
        return DummyEvent;
    }

    // eslint-disable-next-line class-methods-use-this
    avroPath(): string {
        return resolve(__dirname, '../../../../../', 'test/files/avro/dummyEvent.avro');
    }
}

class DummyUnknownEvent extends DomainEvent {
    static eventName = 'dummy:other-event';

    constructor(
        args: { id: string } & {
            eventId?: string;
            occurredOn?: Date;
        }
    ) {
        super(DummyUnknownEvent.eventName, args.id, args.eventId, args.occurredOn);
    }

    // eslint-disable-next-line class-methods-use-this
    toPrimitives(): Record<string, unknown> {
        return {};
    }
}

class DomainEventSubscriberDummy implements DomainEventSubscriber<DummyEvent | DummyUnknownEvent> {
    // eslint-disable-next-line class-methods-use-this
    subscribedTo(): DomainEventName<DummyEvent>[] {
        return [DummyEvent, DummyUnknownEvent];
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    async on(_: DummyEvent): Promise<void> {}
}

const subscribers = [new DomainEventSubscriberDummy()],
    domainEvenAvroPaths = [
        new DummyEventAvroPath()
    ],
    marshaller = new DomainEventAvroMarshaller(new DomainEventMapping(subscribers), new DomainEventAvroMapping(domainEvenAvroPaths));

describe('domainEventAvroMarshaller', () => {
    describe('marshall', () => {
        it('should return an AVRO buffer when there is an AVRO schema for the event', () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: UuidMother.random() });

            marshaller.marshall(event);

            expect(true).toBe(true);
        });

        it("should throw an error when there isn't an AVRO schema for the event", () => {
            expect.hasAssertions();

            const event = new DummyUnknownEvent({ id: UuidMother.random() });

            expect(() => marshaller.marshall(event)).toThrow(`No AVRO schema associated to event <${DummyUnknownEvent.eventName}>`);
        });
    });

    describe('unmarshall', () => {
        it('should decode an AVRO buffer when there is an AVRO schema for the event', () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: UuidMother.random() }),
                buffer = marshaller.marshall(event),
                actual = marshaller.unmarshall(buffer);

            expect(actual).toStrictEqual(event);
        });

        it("should throw an error when there isn't an AVRO schema for the event", () => {
            expect.hasAssertions();

            const buffer = Buffer.from('unknown');

            expect(() => marshaller.unmarshall(buffer)).toThrow('No AVRO schema found for the given buffer');
        });
    });
});
