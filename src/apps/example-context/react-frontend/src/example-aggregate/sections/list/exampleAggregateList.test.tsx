import { ExampleAggregateMother } from '@src/example-aggregate/domain/exampleAggregate.mother';
import type { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import { ExampleAggregateList } from '@src/example-aggregate/sections/list/exampleAggregateList';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@tests/renderWithRouter';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

const repository = mock<ExampleAggregateRepository>();

describe('ExampleAggregateList', () => {
    it('should show all example aggregates', async () => {
        const exampleAggregates = ExampleAggregateMother.randomList();

        repository.findAll.mockResolvedValue(exampleAggregates);

        renderWithRouter(<ExampleAggregateList repository={repository} />);

        const title = await screen.findByRole('heading', {
                name: /Example Aggregate List/i
            }),
            headers = await Promise.all(
                exampleAggregates.map((exampleAggregate) =>
                    screen.findByRole('heading', {
                        name: new RegExp(`${exampleAggregate.name}`, 'i')
                    })
                )
            );

        expect(title).toBeInTheDocument();
        for (const header of headers) {
            expect(header).toBeInTheDocument();
        }
    });

    it("should show a no results message when there aren't example aggregates", async () => {
        repository.findAll.mockResolvedValue([]);

        renderWithRouter(<ExampleAggregateList repository={repository} />);

        const noResults = await screen.findByText(/There aren't example aggregates/i);

        expect(noResults).toBeInTheDocument();
    });
});
