import type { Clock } from '@context/shared/domain/clock';
import type { EventBus } from '@context/shared/domain/eventBus/eventBus';
import type CreateExampleAggregateCommand from '@src/example-aggregate/application/create/createExampleAggregateCommand';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateAlreadyExists from '@src/example-aggregate/domain/exampleAggregateAlreadyExists';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import type { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';

export default class ExampleAggregateCreator {
    private readonly clock: Clock;

    private readonly repository: ExampleAggregateRepository;

    private readonly eventuBus: EventBus;

    constructor(clock: Clock, repository: ExampleAggregateRepository, eventuBus: EventBus) {
        this.clock = clock;
        this.repository = repository;
        this.eventuBus = eventuBus;
    }

    async run({ id }: CreateExampleAggregateCommand): Promise<void> {
        await this.ensureExampleAggregateDoesntExist(id);

        const aggregate = ExampleAggregate.create(id, this.clock.now());

        await this.repository.save(aggregate);
        await this.eventuBus.publish(aggregate.pullDomainEvents());
    }

    private async ensureExampleAggregateDoesntExist(id: string): Promise<void> {
        const aggregate = await this.repository.search(new ExampleAggregateId(id));

        if (aggregate) {
            throw new ExampleAggregateAlreadyExists(id);
        }
    }
}
