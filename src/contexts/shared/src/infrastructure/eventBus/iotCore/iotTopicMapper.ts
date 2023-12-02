import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';

export interface IotTopicMapper<T extends DomainEvent> {
    iotTopicFor(): DomainEventName<T>[];
    composeIotTopic(event: T): string;
}
