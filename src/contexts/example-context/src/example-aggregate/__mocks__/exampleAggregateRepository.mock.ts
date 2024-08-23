import type { Nullable } from '@context/shared/domain/nullable';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import type ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import type { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';

export default class ExampleAggregateRepositoryMock implements ExampleAggregateRepository {
    private mockSave = jest.fn<Promise<void>, ExampleAggregate[], ExampleAggregateRepositoryMock>();

    private mockSearch = jest.fn<Promise<Nullable<ExampleAggregate>>, ExampleAggregateId[], ExampleAggregateRepositoryMock>();

    async save(aggregate: ExampleAggregate): Promise<void> {
        await this.mockSave(aggregate);
    }

    assertSaveHasBeenCalledWith(aggregate: ExampleAggregate): void {
        const { mock } = this.mockSave,
            lastSavedExampleAggregate = mock.calls[mock.calls.length - 1][0],
            expectedBody = aggregate.toPrimitives(),
            lastSavedExampleAggregateBody = lastSavedExampleAggregate.toPrimitives();

        expect(lastSavedExampleAggregate).toBeInstanceOf(ExampleAggregate);
        expect(lastSavedExampleAggregateBody).toStrictEqual(expectedBody);
    }

    search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        return this.mockSearch(id);
    }

    whenSearchThenReturn(aggregate: Nullable<ExampleAggregate>): void {
        this.mockSearch.mockResolvedValue(aggregate);
    }
}
