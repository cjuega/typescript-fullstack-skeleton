import { DomainEvent } from '@src/domain/eventBus/domainEvent';

export interface IotTopicBuilder<T extends DomainEvent> {
    iotTopicFor(): DomainEvent;
    composeIotTopic(event: T): string;
}
