import { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import { Nullable } from '@context/shared/domain/nullable';

export default class ExampleAggregateRepositoryMock implements ExampleAggregateRepository {
    private mockSave = jest.fn();

    private mockSearch = jest.fn();

    async save(aggregate: ExampleAggregate): Promise<void> {
        this.mockSave(aggregate);
    }

    assertSaveHasBeenCalledWith(aggregate: ExampleAggregate): void {
        const { mock } = this.mockSave,
            lastSavedExampleAggregate = mock.calls[mock.calls.length - 1][0] as ExampleAggregate,
            expectedBody = aggregate.toPrimitives(),
            lastSavedExampleAggregateBody = lastSavedExampleAggregate.toPrimitives();

        expect(lastSavedExampleAggregate).toBeInstanceOf(ExampleAggregate);
        expect(lastSavedExampleAggregateBody).toStrictEqual(expectedBody);
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        return this.mockSearch(id);
    }

    whenSearchThenReturn(aggregate: Nullable<ExampleAggregate>): void {
        this.mockSearch.mockReturnValue(aggregate);
    }
}
