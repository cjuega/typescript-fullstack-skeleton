import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import ObjectMother from '@src/domain/objectMother.mother';
import DomainEventProtobufMapping, {
    DomainEventProtobufPathPair
} from '@src/infrastructure/eventBus/marshallers/protobuf/domainEventProtobufMapping';
import DomainEventProtobufMarshaller from '@src/infrastructure/eventBus/marshallers/protobuf/domainEventProtobufMarshaller';
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

    toPrimitives(): Record<string, unknown> {
        return {};
    }
}

class DummyEventProtobufPath implements DomainEventProtobufPathPair<DummyEvent> {
    schemaFor(): DomainEventName<DummyEvent> {
        return DummyEvent;
    }

    protoFilepath(): string {
        return resolve(__dirname, '../../../../../', 'test/files/protobuf/dummyEvent.proto');
    }

    messagePath(): string {
        return 'packageName.DummyEvent';
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
    domainEvenProtobufPaths = [new DummyEventProtobufPath()],
    marshaller = new DomainEventProtobufMarshaller(
        new DomainEventMapping(subscribers),
        new DomainEventProtobufMapping(domainEvenProtobufPaths)
    );

describe('domainEventProtobufMarshaller', () => {
    beforeAll(async () => {
        const wait = (ms: number): Promise<void> => new Promise((r) => { setTimeout(r, ms); });

        // Hacky trick to prevent DomainEventProtobufMarshaller to use promises
        await wait(500);
    });

    describe('marshall', () => {
        it('should return an Protobuf when there is a Protobuf schema for the event', () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: ObjectMother.uuid() });

            marshaller.marshall(event);

            expect(true).toBe(true);
        });

        it("should throw an error when there isn't an Protobuf schema for the event", () => {
            expect.hasAssertions();

            const event = new DummyUnknownEvent({ id: ObjectMother.uuid() });

            expect(() => marshaller.marshall(event)).toThrow(`No Protobuf schema associated to event <${DummyUnknownEvent.eventName}>`);
        });
    });

    describe('unmarshall', () => {
        it('should decode a Protobuf buffer when there is a Protobuf schema for the event', () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: ObjectMother.uuid() }),
                buffer = marshaller.marshall(event),
                actual = marshaller.unmarshall(buffer);

            expect(actual).toStrictEqual(event);
        });

        it("should throw an error when there isn't a Protobuf schema for the event", () => {
            expect.hasAssertions();

            const buffer = Buffer.from('unknown');

            expect(() => marshaller.unmarshall(buffer)).toThrow('No Protobuf schema found for the given buffer');
        });
    });
});
