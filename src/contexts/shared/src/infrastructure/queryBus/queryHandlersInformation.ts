import Query from '@src/domain/queryBus/query';
import { QueryHandler } from '@src/domain/queryBus/queryHandler';
import { Response } from '@src/domain/queryBus/response';
import QueryNotRegisteredError from '@src/domain/queryBus/queryNotRegisteredError';

export default class QueryHandlersInformation {
    private queryHandlersMap: Map<Query, QueryHandler<Query, Response>>;

    constructor(queryHandlers: Array<QueryHandler<Query, Response>>) {
        this.queryHandlersMap = this.formatHandlers(queryHandlers);
    }

    // eslint-disable-next-line class-methods-use-this
    private formatHandlers(queryHandlers: Array<QueryHandler<Query, Response>>): Map<Query, QueryHandler<Query, Response>> {
        const handlersMap = new Map();

        queryHandlers.forEach((queryHandler) => {
            handlersMap.set(queryHandler.subscribedTo(), queryHandler);
        });

        return handlersMap;
    }

    public search(query: Query): QueryHandler<Query, Response> {
        const queryHandler = this.queryHandlersMap.get(query.constructor);

        if (!queryHandler) {
            throw new QueryNotRegisteredError(query);
        }

        return queryHandler;
    }
}
