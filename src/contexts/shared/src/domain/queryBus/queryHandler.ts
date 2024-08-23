import type Query from '@src/domain/queryBus/query';
import type { Response } from '@src/domain/queryBus/response';

export interface QueryHandler<Q extends Query, R extends Response> {
    subscribedTo(): Query;
    handle(query: Q): Promise<R>;
}
