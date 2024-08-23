import { resolve } from 'node:path';
import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import type { DomainEventName } from '@src/domain/eventBus/domainEventName';
import type { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import ObjectMother from '@src/domain/objectMother.mother';
import DomainEventAvroMapping, { type DomainEventAvroPathPair } from '@src/infrastructure/eventBus/marshallers/avro/domainEventAvroMapping';
import DomainEventAvroMarshaller from '@src/infrastructure/eventBus/marshallers/avro/domainEventAvroMarshaller';

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

class DummyEventAvroPath implements DomainEventAvroPathPair<DummyEvent> {
    schemaFor(): DomainEventName<DummyEvent> {
        return DummyEvent;
    }

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

    toPrimitives(): Record<string, unknown> {
        return {};
    }
}

class DomainEventSubscriberDummy implements DomainEventSubscriber<DummyEvent | DummyUnknownEvent> {
    name(): string {
        throw new Error('Method not implemented.');
    }

    subscribedTo(): DomainEventName<DummyEvent>[] {
        return [DummyEvent, DummyUnknownEvent];
    }

    async on(_: DummyEvent): Promise<void> {}
}

const subscribers = [new DomainEventSubscriberDummy()],
    domainEvenAvroPaths = [new DummyEventAvroPath()],
    marshaller = new DomainEventAvroMarshaller(new DomainEventMapping(subscribers), new DomainEventAvroMapping(domainEvenAvroPaths));

describe('domainEventAvroMarshaller', () => {
    describe('marshall', () => {
        it('should return an AVRO buffer when there is an AVRO schema for the event', () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: ObjectMother.uuid() });

            marshaller.marshall(event);

            expect(true).toBe(true);
        });

        it("should throw an error when there isn't an AVRO schema for the event", () => {
            expect.hasAssertions();

            const event = new DummyUnknownEvent({ id: ObjectMother.uuid() });

            expect(() => marshaller.marshall(event)).toThrow(`No AVRO schema associated to event <${DummyUnknownEvent.eventName}>`);
        });
    });

    describe('unmarshall', () => {
        it('should decode an AVRO buffer when there is an AVRO schema for the event', () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: ObjectMother.uuid() }),
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
