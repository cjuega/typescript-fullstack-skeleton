import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventDeduplicator } from '@src/domain/eventBus/domainEventDeduplicator';
import type { EventBusMiddleware } from '@src/domain/eventBus/eventBusMiddleware';

export default class EventBusDeduplicatorMiddleware implements EventBusMiddleware {
    private deduplicator: DomainEventDeduplicator;

    constructor(deduplicator: DomainEventDeduplicator) {
        this.deduplicator = deduplicator;
    }

    run(events: DomainEvent[]): Promise<DomainEvent[]> {
        return this.deduplicator.deduplicate(events);
    }
}
