import { DomainEvent } from '@src/domain/eventBus/domainEvent';
import { IotTopicBuilder } from '@src/infrastructure/eventBus/iotCore/iotTopicBuilder';

export default class IotCoreDomainEventsInformation {
    private domainEventsMap: Map<DomainEvent, IotTopicBuilder<DomainEvent>>;

    constructor(iotTopicBuilders: Array<IotTopicBuilder<DomainEvent>>) {
        this.domainEventsMap = IotCoreDomainEventsInformation.formatBuilders(iotTopicBuilders);
    }

    private static formatBuilders(iotTopicBuilders: Array<IotTopicBuilder<DomainEvent>>): Map<DomainEvent, IotTopicBuilder<DomainEvent>> {
        const buildersMap = new Map<DomainEvent, IotTopicBuilder<DomainEvent>>();

        iotTopicBuilders.forEach((iotTopicBuilder) => {
            buildersMap.set(iotTopicBuilder.iotTopicFor(), iotTopicBuilder);
        });

        return buildersMap;
    }

    composeIotTopic(event: DomainEvent): string | undefined {
        const builder = this.domainEventsMap.get(event);

        if (!builder) {
            return undefined;
        }

        return builder.composeIotTopic(event);
    }
}
