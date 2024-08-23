import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { KafkaTopicMapper } from '@src/infrastructure/eventBus/kafka/kafkaTopicMapper';

type Mapping = Map<string, KafkaTopicMapper<DomainEvent>>;

export default class KafkaDomainEventsMapper {
    private domainEventsMap: Mapping;

    constructor(kafkaTopicMappers: KafkaTopicMapper<DomainEvent>[]) {
        this.domainEventsMap = KafkaDomainEventsMapper.formatMappers(kafkaTopicMappers);
    }

    private static formatMappers(kafkaTopicMappers: KafkaTopicMapper<DomainEvent>[]): Mapping {
        return kafkaTopicMappers.reduce(
            (map, kafkaTopicMapper) =>
                kafkaTopicMapper.kafkaTopicFor().reduce((acc, eventClass) => acc.set(eventClass.eventName, kafkaTopicMapper), map),
            new Map<string, KafkaTopicMapper<DomainEvent>>()
        );
    }

    composeKafkaTopic(event: DomainEvent): string | undefined {
        const mapper = this.domainEventsMap.get(event.eventName);

        if (!mapper) {
            return undefined;
        }

        return mapper.composeKafkaTopic(event);
    }
}
