export default class ExampleAggregateAlreadyExists extends Error {
    constructor(id: string) {
        super(`ExampleAggregate <${id}> already exists`);
    }
}
