import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventRepository } from '@src/domain/eventBus/domainEventRepository';
import { EventBus } from '@src/domain/eventBus/eventBus';

export default class WithFailover implements EventBus {
    private readonly eventBus: EventBus;

    private readonly repository: DomainEventRepository;

    constructor(eventBus: EventBus, repository: DomainEventRepository) {
        this.eventBus = eventBus;
        this.repository = repository;
    }

    async publish(events: DomainEvent[]): Promise<void> {
        await Promise.all(
            events.map(async (event) => {
                try {
                    await this.eventBus.publish([event]);
                } catch {
                    await this.failover(event);
                }
            })
        );
    }

    private async failover(event: DomainEvent): Promise<void> {
        await this.repository.save(event);
    }
}
