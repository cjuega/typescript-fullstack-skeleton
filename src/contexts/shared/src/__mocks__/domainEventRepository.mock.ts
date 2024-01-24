import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventRepository } from '@src/domain/eventBus/domainEventRepository';

export default class DomainEventRepositoryMock implements DomainEventRepository {
    private mockSave = jest.fn<Promise<void>, Array<DomainEvent | DomainEvent[]>, DomainEventRepositoryMock>();

    async save(events: DomainEvent | DomainEvent[]): Promise<void> {
        await this.mockSave(events);
    }

    assertSaveHasBeenWith(events: DomainEvent[]): void {
        const { mock } = this.mockSave,
            actualSavedEvents = mock.calls.map((c) => c[0]).flat();

        expect(mock.calls).toHaveLength(events.length);

        events.forEach((e) => {
            expect(actualSavedEvents).toContainEqual(e);
        });
    }

    assertNothingSaved(): void {
        expect(this.mockSave).not.toHaveBeenCalled();
    }
}
