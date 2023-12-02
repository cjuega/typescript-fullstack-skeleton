import DomainEvent from '@src/domain/eventBus/domainEvent';

export type DomainEventName<T extends DomainEvent> = Pick<T, 'eventName'>;
