import { EventBusMiddleware } from '@src/domain/eventBus/eventBusMiddleware';
import { DomainEventDeduplicator } from '@src/domain/eventBus/domainEventDeduplicator';
import DomainEvent from '@src/domain/eventBus/domainEvent';

export default class EventBusDeduplicatorMiddleware implements EventBusMiddleware {
    private deduplicator: DomainEventDeduplicator;

    constructor(deduplicator: DomainEventDeduplicator) {
        this.deduplicator = deduplicator;
    }

    async run(events: DomainEvent[]): Promise<DomainEvent[]> {
        return this.deduplicator.deduplicate(events);
    }
}
