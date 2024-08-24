import type { ExampleAggregate } from '@src/example-aggregate/domain/exampleAggregate';
import type { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import { useEffect, useState } from 'react';

export function useExampleAggregates(repository: ExampleAggregateRepository): ExampleAggregate[] {
    const [exampleAggregates, setExampleAggregates] = useState<ExampleAggregate[]>([]);

    useEffect(() => {
        repository.findAll().then(setExampleAggregates);
    }, [repository]);

    return exampleAggregates;
}
