import DomainEvent from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import ObjectMother from '@src/domain/objectMother.mother';
import DomainEventJsonMarshaller from '@src/infrastructure/eventBus/marshallers/json/domainEventJsonMarshaller';
import NoopLogger from '@src/infrastructure/logger/noopLogger';
import DdbOneTableClientFactory from '@src/infrastructure/persistence/ddbOneTable/ddbOneTableClientFactory';
import DdbOneTableDomainEventRepository from '@src/infrastructure/persistence/ddbOneTable/ddbOneTableDomainEventRepository';
import DdbOneTableEnvironmentArranger from '@src/infrastructure/persistence/ddbOneTable/ddbOneTableEnvironmentArranger';
import DynamodbClientFactory from '@src/infrastructure/persistence/dynamodb/dynamodbClientFactory';

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

const noLogger = new NoopLogger(),
    table = DdbOneTableClientFactory.createClient(
        'integration-tests',
        DynamodbClientFactory.createClient(
            'integration-tests',
            {
                region: 'localhost',
                endpoint: 'http://localhost:8000',
                sslEnabled: false
            },
            noLogger
        ),
        {
            tableName: 'db-integration-tests',
            indexes: { primary: { hash: 'pk', sort: 'sk' } }
        },
        noLogger
    ),
    environmentArranger = new DdbOneTableEnvironmentArranger(table),
    marshaller = new DomainEventJsonMarshaller(new DomainEventMapping([])),
    repository = new DdbOneTableDomainEventRepository(table, marshaller, { partitionPrefix: 'failedEvents' });

describe('ddbOneTableDomainEventRepository', () => {
    beforeEach(async () => {
        await environmentArranger.arrange();
    });

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

            const transaction = {};

            await repository.transactSave([], transaction);

            expect(true).toBe(true);
        });

        it('should save a DomainEvent', async () => {
            expect.hasAssertions();

            const event = new DummyEvent({ id: ObjectMother.uuid() }),
                transaction = {};

            await repository.transactSave(event, transaction);

            expect(true).toBe(true);
        });

        it('should save a list of DomainEvents transactionally', async () => {
            expect.hasAssertions();

            const nEvents = 10,
                events = ObjectMother.repeat(() => new DummyEvent({ id: ObjectMother.uuid() }), nEvents),
                transaction = {};

            await repository.transactSave(events, transaction);

            expect(true).toBe(true);
        });
    });
});
