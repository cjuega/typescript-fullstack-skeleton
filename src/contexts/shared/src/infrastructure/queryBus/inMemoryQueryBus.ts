import type Query from '@src/domain/queryBus/query';
import type { QueryBus } from '@src/domain/queryBus/queryBus';
import type { Response } from '@src/domain/queryBus/response';
import type QueryHandlersInformation from '@src/infrastructure/queryBus/queryHandlersInformation';

export default class InMemoryQueryBus implements QueryBus {
    private queryHandlersInformation: QueryHandlersInformation;

    constructor(queryHandlersInformation: QueryHandlersInformation) {
        this.queryHandlersInformation = queryHandlersInformation;
    }

    async ask<R extends Response>(query: Query): Promise<R> {
        const handler = this.queryHandlersInformation.search(query),
            response = (await handler.handle(query)) as R;

        return response;
    }
}
