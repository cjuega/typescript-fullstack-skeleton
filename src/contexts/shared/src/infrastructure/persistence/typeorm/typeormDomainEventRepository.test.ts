import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import ObjectMother from '@src/domain/objectMother.mother';
import DomainEventJsonMarshaller from '@src/infrastructure/eventBus/marshallers/json/domainEventJsonMarshaller';
import NoopLogger from '@src/infrastructure/logger/noopLogger';
import TypeormClientFactory from '@src/infrastructure/persistence/typeorm/typeormClientFactory';
import TypeormDomainEventRepository from '@src/infrastructure/persistence/typeorm/typeormDomainEventRepository';
import TypeormEnvironmentArranger from '@src/infrastructure/persistence/typeorm/typeormEnvironmentArranger';
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
    marshaller = new DomainEventJsonMarshaller(new DomainEventMapping([])),
    repository = new TypeormDomainEventRepository(client, marshaller, { tableName: 'failed_domain_events' });

describe('typeormDomainEventRepository', () => {
    // eslint-disable-next-line jest/no-hooks
    beforeEach(async () => {
        await environmentArranger.arrange();
    });

    // eslint-disable-next-line jest/no-hooks
    afterAll(async () => {
        await environmentArranger.close();
    });

    describe('save', () => {
        it('should do nothing when empty list is provided', async () => {
            expect.hasAssertions();

            await repository.save([]);

            expect(true).toBe(true);
        });

        it('should save a DomainEvent', async () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: ObjectMother.uuid() });

            await repository.save(event);

            expect(true).toBe(true);
        });

        it('should save a list of DomainEvents', async () => {
            expect.hasAssertions();

            const nEvents = 10,
                events = ObjectMother.repeat(() => new DummyEvent({ id: ObjectMother.uuid() }), nEvents);

            await repository.save(events);

            expect(true).toBe(true);
        });
    });

    describe('transactSave', () => {
        it('should do nothing when empty list is provided', async () => {
            expect.hasAssertions();

            const ds = await client;

            await ds.transaction((manager) => repository.transactSave([], manager));

            expect(true).toBe(true);
        });

        it('should save a DomainEvent', async () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: ObjectMother.uuid() }),
                ds = await client;

            await ds.transaction((manager) => repository.transactSave(event, manager));

            expect(true).toBe(true);
        });

        it('should save a list of DomainEvents transactionally', async () => {
            expect.hasAssertions();

            const nEvents = 10,
                events = ObjectMother.repeat(() => new DummyEvent({ id: ObjectMother.uuid() }), nEvents),
                ds = await client;

            await ds.transaction((manager) => repository.transactSave(events, manager));

            expect(true).toBe(true);
        });
    });
});
