/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import Query from '@src/domain/queryBus/query';
import QueryHandlersInformation from '@src/infrastructure/queryBus/queryHandlersInformation';
import QueryNotRegisteredError from '@src/domain/queryBus/queryNotRegisteredError';
import { QueryHandler } from '@src/domain/queryBus/queryHandler';
import { Response } from '@src/domain/queryBus/response';
import InMemoryQueryBus from '@src/infrastructure/queryBus/inMemoryQueryBus';

class UnhandledQuery extends Query {
    static QUERY_NAME = 'unhandled.query';
}

class HandledQuery extends Query {
    static QUERY_NAME = 'handled.query';
}

class MyQueryHandler implements QueryHandler<Query, Response> {
    subscribedTo(): HandledQuery {
        return HandledQuery;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handle(_query: HandledQuery): Promise<Response> {
        return Promise.resolve({});
    }
}

describe('inMemoryQueryBus', () => {
    it('throws an error if dispatches a query without handler', async () => {
        expect.hasAssertions();

        const unhandledQuery = new UnhandledQuery(),
            queryHandlersInformation = new QueryHandlersInformation([]),
            queryBus = new InMemoryQueryBus(queryHandlersInformation);

        let error;

        try {
            await queryBus.ask(unhandledQuery);
        } catch (e) {
            error = e;
        } finally {
            expect(error).toBeInstanceOf(QueryNotRegisteredError);
            expect((error as Error).message).toBe("The query <UnhandledQuery> hasn't a query handler associated");
        }
    });

    // eslint-disable-next-line jest/prefer-expect-assertions,jest/expect-expect
    it('accepts a query with handler', async () => {
        const handledQuery = new HandledQuery(),
            myQueryHandler = new MyQueryHandler(),
            queryHandlersInformation = new QueryHandlersInformation([myQueryHandler]),
            queryBus = new InMemoryQueryBus(queryHandlersInformation);

        await queryBus.ask(handledQuery);
    });
});
