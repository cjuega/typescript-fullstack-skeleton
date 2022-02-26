import { DomainEvent } from '@src/domain/eventBus/domainEvent';

export interface EventBus {
    publish(events: Array<DomainEvent>): Promise<void>;
}
