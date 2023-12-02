import DomainEvent from '@src/domain/eventBus/domainEvent';
import { KafkaTopicMapper } from '@src/infrastructure/eventBus/kafka/kafkaTopicMapper';

type Mapping = Map<string, KafkaTopicMapper<DomainEvent>>;

export default class KafkaDomainEventsMapper {
    private domainEventsMap: Mapping;

    constructor(kafkaTopicMappers: KafkaTopicMapper<DomainEvent>[]) {
        this.domainEventsMap = KafkaDomainEventsMapper.formatMappers(kafkaTopicMappers);
    }

    private static formatMappers(kafkaTopicMappers: KafkaTopicMapper<DomainEvent>[]): Mapping {
        const mappersMap = new Map<string, KafkaTopicMapper<DomainEvent>>();

        kafkaTopicMappers.forEach((kafkaTopicMapper) => {
            kafkaTopicMapper.kafkaTopicFor().forEach((eventClass) => {
                mappersMap.set(eventClass.eventName, kafkaTopicMapper);
            });
        });

        return mappersMap;
    }

    composeKafkaTopic(event: DomainEvent): string | undefined {
        const mapper = this.domainEventsMap.get(event.eventName);

        if (!mapper) {
            return undefined;
        }

        return mapper.composeKafkaTopic(event);
    }
}
