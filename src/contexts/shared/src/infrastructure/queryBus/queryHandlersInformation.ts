import type Query from '@src/domain/queryBus/query';
import type { QueryHandler } from '@src/domain/queryBus/queryHandler';
import QueryNotRegisteredError from '@src/domain/queryBus/queryNotRegisteredError';
import type { Response } from '@src/domain/queryBus/response';

export default class QueryHandlersInformation {
    private queryHandlersMap: Map<Query, QueryHandler<Query, Response>>;

    constructor(queryHandlers: QueryHandler<Query, Response>[]) {
        this.queryHandlersMap = this.formatHandlers(queryHandlers);
    }

    private formatHandlers(queryHandlers: QueryHandler<Query, Response>[]): Map<Query, QueryHandler<Query, Response>> {
        return queryHandlers.reduce(
            (map, queryHandler) => map.set(queryHandler.subscribedTo(), queryHandler),
            new Map<Query, QueryHandler<Query, Response>>()
        );
    }

    public search(query: Query): QueryHandler<Query, Response> {
        const queryHandler = this.queryHandlersMap.get(query.constructor);

        if (!queryHandler) {
            throw new QueryNotRegisteredError(query);
        }

        return queryHandler;
    }
}
