import Query from '@src/domain/queryBus/query';
import { Response } from '@src/domain/queryBus/response';

export interface QueryBus {
    ask<R extends Response>(query: Query): Promise<R>;
}
