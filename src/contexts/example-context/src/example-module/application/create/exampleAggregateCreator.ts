import { Clock } from '@context/shared/domain/clock';
import { ExampleAggregateRepository } from '@src/example-module/domain/exampleAggregateRepository';
import { EventBus } from '@context/shared/domain/eventBus/eventBus';
import ExampleAggregateId from '@src/example-module/domain/exampleAggregateId';
import ExampleAggregate from '@src/example-module/domain/exampleAggregate';
import ExampleAggregateAlreadyExists from '@src/example-module/domain/exampleAggregateAlreadyExists';

type CreateExampleAggregateParams = {
    readonly id: ExampleAggregateId;
};

export default class ExampleAggregateCreator {
    private readonly clock: Clock;

    private readonly repository: ExampleAggregateRepository;

    private readonly eventuBus: EventBus;

    constructor(clock: Clock, repository: ExampleAggregateRepository, eventuBus: EventBus) {
        this.clock = clock;
        this.repository = repository;
        this.eventuBus = eventuBus;
    }

    async run({ id }: CreateExampleAggregateParams): Promise<void> {
        await this.ensureExampleAggregateDoesntExist(id);

        const aggregate = ExampleAggregate.create(id, this.clock.now());

        await this.repository.save(aggregate);
        await this.eventuBus.publish(aggregate.pullDomainEvents());
    }

    private async ensureExampleAggregateDoesntExist(id: ExampleAggregateId): Promise<void> {
        const aggregate = await this.repository.search(id);

        if (aggregate) {
            throw new ExampleAggregateAlreadyExists(id.value);
        }
    }
}
