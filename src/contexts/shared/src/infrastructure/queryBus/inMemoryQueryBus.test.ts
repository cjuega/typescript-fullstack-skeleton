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

        await expect(queryBus.ask(unhandledQuery)).rejects.toThrow(QueryNotRegisteredError);
    });

    it('accepts a query with handler', async () => {
        const handledQuery = new HandledQuery(),
            myQueryHandler = new MyQueryHandler(),
            queryHandlersInformation = new QueryHandlersInformation([myQueryHandler]),
            queryBus = new InMemoryQueryBus(queryHandlersInformation);

        await queryBus.ask(handledQuery);
    });
});
