import ClockMock from '@context/shared/__mocks__/clock.mock';
import EventBusMock from '@context/shared/__mocks__/eventBus.mock';
import ExampleAggregateRepositoryMock from '@src/example-aggregate/__mocks__/exampleAggregateRepository.mock';
import ExampleAggregateAlreadyExists from '@src/example-aggregate/domain/exampleAggregateAlreadyExists';
import CreateExampleAggregateCommandHandler from '@src/example-aggregate/application/create/createExampleAggregateCommandHandler';
import ExampleAggregateCreator from '@src/example-aggregate/application/create/exampleAggregateCreator';
import CreateExampleAggregateCommandMother from '@src/example-aggregate/application/create/createExampleAggregateCommand.mother';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import DatetimeMother from '@context/shared/domain/datetime.mother';
import ExampleAggregateCreatedDomainEventMother from '@src/example-aggregate/domain/exampleAggregateCreatedDomainEvent.mother';

describe('exampleAggregateCreator', () => {
    it('should throw a ExampleAggregateAlreadyExists when creating an exampleAggregate which id already exists', async () => {
        expect.hasAssertions();

        const clock = new ClockMock(),
            repository = new ExampleAggregateRepositoryMock(),
            eventBus = new EventBusMock(),
            handler = new CreateExampleAggregateCommandHandler(new ExampleAggregateCreator(clock, repository, eventBus)),
            exampleAggregate = ExampleAggregateMother.random(),
            command = CreateExampleAggregateCommandMother.random({ id: exampleAggregate.id.value });

        clock.whenNowThenReturn(DatetimeMother.random());
        repository.whenSearchThenReturn(exampleAggregate);

        let error;

        try {
            await handler.handle(command);
        } catch (e) {
            error = e;
        } finally {
            expect(error).toBeInstanceOf(ExampleAggregateAlreadyExists);
        }
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
