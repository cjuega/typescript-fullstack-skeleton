import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventRepository } from '@src/domain/eventBus/domainEventRepository';

export default class DomainEventRepositoryMock implements DomainEventRepository {
    private mockSave = jest.fn<Promise<void>, Array<DomainEvent | DomainEvent[]>, DomainEventRepositoryMock>();

    async save(events: DomainEvent | DomainEvent[]): Promise<void> {
        await this.mockSave(events);
    }

    assertSaveHasBeenWith(events: DomainEvent[]): void {
        const { mock } = this.mockSave,
            actualSavedEvents = mock.calls.flatMap((c) => c[0]);

        expect(mock.calls).toHaveLength(events.length);

        for (const e of events) {
            expect(actualSavedEvents).toContainEqual(e);
        }
    }

    assertNothingSaved(): void {
        expect(this.mockSave).not.toHaveBeenCalled();
    }
}
