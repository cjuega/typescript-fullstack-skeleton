import { DomainEvent } from '@src/domain/eventBus/domainEvent';

export interface Marshaller {
    marshall(event: DomainEvent): unknown;
}
