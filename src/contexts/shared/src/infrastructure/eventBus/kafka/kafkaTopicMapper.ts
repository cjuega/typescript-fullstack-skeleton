import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';

export interface KafkaTopicMapper<T extends DomainEvent> {
    kafkaTopicFor(): DomainEventName<T>[];
    composeKafkaTopic(event: T): string;
}
