import type Query from '@src/domain/queryBus/query';

export default class QueryNotRegisteredError extends Error {
    constructor(query: Query) {
        super(`The query <${query.constructor.name}> hasn't a query handler associated`);
    }
}
