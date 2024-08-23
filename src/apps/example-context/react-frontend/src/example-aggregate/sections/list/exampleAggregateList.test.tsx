import { describe, it, expect } from 'vitest';
import { render, screen } from "@testing-library/react";
import { mock } from 'vitest-mock-extended';
import { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import { ExampleAggregateList } from '@src/example-aggregate/sections/list/exampleAggregateList';
import { ExampleAggregateMother } from '@src/example-aggregate/domain/exampleAggregate.mother';

const repository = mock<ExampleAggregateRepository>();

describe('ExampleAggregateList', () => {
    it('should show all example aggregates', async () => {
        const exampleAggregates = ExampleAggregateMother.randomList();

        repository.findAll.mockResolvedValue(exampleAggregates);

        render(<ExampleAggregateList repository={repository} />);

        const title = await screen.findByRole("heading", {
            name: new RegExp("Example Aggregate List", "i"),
        }),
            headers = await Promise.all(exampleAggregates.map((exampleAggregate) => screen.findByRole("heading", {
                name: new RegExp(`${exampleAggregate.name}`, "i"),
            })));

        expect(title).toBeInTheDocument();
        headers.forEach((header) => expect(header).toBeInTheDocument());
    });

    it('should show a no results message when there aren\'t example aggregates', async () => {
        repository.findAll.mockResolvedValue([]);

        render(<ExampleAggregateList repository={repository} />);

        const noResults = await screen.findByText(new RegExp("There aren't example aggregates", "i"));

        expect(noResults).toBeInTheDocument();
    });
});