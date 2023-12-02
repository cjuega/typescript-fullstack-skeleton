import DomainEvent from '@src/domain/eventBus/domainEvent';
import { IotTopicMapper } from '@src/infrastructure/eventBus/iotCore/iotTopicMapper';

type Mapping = Map<string, IotTopicMapper<DomainEvent>>;

export default class IotCoreDomainEventsMapper {
    private domainEventsMap: Mapping;

    constructor(iotTopicMappers: Array<IotTopicMapper<DomainEvent>>) {
        this.domainEventsMap = IotCoreDomainEventsMapper.formatMappers(iotTopicMappers);
    }

    private static formatMappers(iotTopicMappers: Array<IotTopicMapper<DomainEvent>>): Mapping {
        const mappersMap = new Map<string, IotTopicMapper<DomainEvent>>();

        iotTopicMappers.forEach((iotTopicMapper) => {
            iotTopicMapper.iotTopicFor().forEach((eventClass) => {
                mappersMap.set(eventClass.eventName, iotTopicMapper);
            });
        });

        return mappersMap;
    }

    composeIotTopic(event: DomainEvent): string | undefined {
        const mapper = this.domainEventsMap.get(event.eventName);

        if (!mapper) {
            return undefined;
        }

        return mapper.composeIotTopic(event);
    }
}
