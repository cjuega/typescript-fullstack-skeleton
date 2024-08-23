import ClockMock from '@context/shared/__mocks__/clock.mock';
import EventBusMock from '@context/shared/__mocks__/eventBus.mock';
import DatetimeMother from '@context/shared/domain/datetime.mother';
import ExampleAggregateRepositoryMock from '@src/example-aggregate/__mocks__/exampleAggregateRepository.mock';
import CreateExampleAggregateCommandMother from '@src/example-aggregate/application/create/createExampleAggregateCommand.mother';
import CreateExampleAggregateCommandHandler from '@src/example-aggregate/application/create/createExampleAggregateCommandHandler';
import ExampleAggregateCreator from '@src/example-aggregate/application/create/exampleAggregateCreator';
import ExampleAggregateAlreadyExists from '@src/example-aggregate/domain/exampleAggregateAlreadyExists';
import ExampleAggregateCreatedDomainEventMother from '@src/example-aggregate/domain/exampleAggregateCreatedDomainEvent.mother';

describe('exampleAggregateCreator', () => {
    it('should throw a ExampleAggregateAlreadyExists when creating an exampleAggregate which id already exists', async () => {
        expect.hasAssertions();

        const clock = new ClockMock(),
            repository = new ExampleAggregateRepositoryMock(),
            eventBus = new EventBusMock(),
            handler = new CreateExampleAggregateCommandHandler(new ExampleAggregateCreator(clock, repository, eventBus)),
            command = CreateExampleAggregateCommandMother.random(),
            createdAt = DatetimeMother.random(),
            exampleAggregate = CreateExampleAggregateCommandMother.applyCommand(command, { createdAt });

        clock.whenNowThenReturn(createdAt);
        repository.whenSearchThenReturn(exampleAggregate);

        await expect(handler.handle(command)).rejects.toThrow(ExampleAggregateAlreadyExists);
    });

    it('should create a valid exampleAggregate', async () => {
        expect.hasAssertions();

        const clock = new ClockMock(),
            repository = new ExampleAggregateRepositoryMock(),
            eventBus = new EventBusMock(),
            handler = new CreateExampleAggregateCommandHandler(new ExampleAggregateCreator(clock, repository, eventBus)),
            command = CreateExampleAggregateCommandMother.random(),
            createdAt = DatetimeMother.random(),
            expected = CreateExampleAggregateCommandMother.applyCommand(command, { createdAt });

        clock.whenNowThenReturn(createdAt);
        repository.whenSearchThenReturn(null);

        await handler.handle(command);

        repository.assertSaveHasBeenCalledWith(expected);
    });

    it('should publish an ExampleAggregateCreatedDomainEvent', async () => {
        expect.hasAssertions();

        const clock = new ClockMock(),
            repository = new ExampleAggregateRepositoryMock(),
            eventBus = new EventBusMock(),
            handler = new CreateExampleAggregateCommandHandler(new ExampleAggregateCreator(clock, repository, eventBus)),
            command = CreateExampleAggregateCommandMother.random(),
            createdAt = DatetimeMother.random(),
            expected = ExampleAggregateCreatedDomainEventMother.fromExampleAggregate(
                CreateExampleAggregateCommandMother.applyCommand(command, { createdAt })
            );

        clock.whenNowThenReturn(createdAt);
        repository.whenSearchThenReturn(null);

        await handler.handle(command);

        eventBus.assertLastPublishedEventIs(expected);
    });
});
