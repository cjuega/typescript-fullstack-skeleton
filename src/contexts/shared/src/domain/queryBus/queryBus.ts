import type Query from '@src/domain/queryBus/query';
import type { Response } from '@src/domain/queryBus/response';

export interface QueryBus {
    ask<R extends Response>(query: Query): Promise<R>;
}
