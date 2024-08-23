import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { IotTopicMapper } from '@src/infrastructure/eventBus/iotCore/iotTopicMapper';

type Mapping = Map<string, IotTopicMapper<DomainEvent>>;

export default class IotCoreDomainEventsMapper {
    private domainEventsMap: Mapping;

    constructor(iotTopicMappers: IotTopicMapper<DomainEvent>[]) {
        this.domainEventsMap = IotCoreDomainEventsMapper.formatMappers(iotTopicMappers);
    }

    private static formatMappers(iotTopicMappers: IotTopicMapper<DomainEvent>[]): Mapping {
        return iotTopicMappers.reduce(
            (map, iotTopicMapper) =>
                iotTopicMapper.iotTopicFor().reduce((acc, eventClass) => acc.set(eventClass.eventName, iotTopicMapper), map),
            new Map<string, IotTopicMapper<DomainEvent>>()
        );
    }

    composeIotTopic(event: DomainEvent): string | undefined {
        const mapper = this.domainEventsMap.get(event.eventName);

        if (!mapper) {
            return undefined;
        }

        return mapper.composeIotTopic(event);
    }
}
