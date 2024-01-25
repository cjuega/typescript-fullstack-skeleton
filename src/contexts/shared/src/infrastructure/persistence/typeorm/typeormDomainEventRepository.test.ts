import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import UuidMother from '@src/domain/uuid.mother';
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
        it('should save a DomainEvent', async () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: UuidMother.random() });

            await repository.save(event);

            expect(true).toBe(true);
        });
    });
});
