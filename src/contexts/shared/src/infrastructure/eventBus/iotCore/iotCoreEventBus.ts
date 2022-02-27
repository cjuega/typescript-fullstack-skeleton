import { DomainEvent } from '@src/domain/eventBus/domainEvent';
import { EventBus } from '@src/domain/eventBus/eventBus';
import { Marshaller } from '@src/domain/eventBus/marshaller';
import Iot from 'aws-sdk/clients/iot';
import IotData from 'aws-sdk/clients/iotdata';
import IotCoreConfig from '@src/infrastructure/eventBus/iotCore/iotCoreConfig';
import IotCoreDomainEventsInformation from '@src/infrastructure/eventBus/iotCore/iotCoreDomainEventsInformation';

export default class IotCoreEventBus implements EventBus {
    private readonly iot: Iot;

    private readonly eventsInformation: IotCoreDomainEventsInformation;

    private readonly marshaller: Marshaller;

    private readonly config: IotCoreConfig;

    private dataClient: IotData | undefined;

    constructor(iot: Iot, eventsInformation: IotCoreDomainEventsInformation, marshaller: Marshaller, config: IotCoreConfig) {
        this.iot = iot;
        this.eventsInformation = eventsInformation;
        this.marshaller = marshaller;
        this.config = config;
    }

    async publish(events: DomainEvent[]): Promise<void> {
        if (!events.length) {
            return;
        }

        const client = await this.client();

        await Promise.all(
            events
                .filter((event) => this.getTopicFor(event))
                .map((event) => {
                    const params = {
                        topic: this.getTopicFor(event)!,
                        qos: 0,
                        payload: JSON.stringify(this.marshaller.marshall(event))
                    };

                    return client.publish(params).promise();
                })
        );
    }

    private async client(): Promise<IotData> {
        if (!this.dataClient) {
            const params = { endpointType: 'iot:Data' },
                { endpointAddress } = await this.iot.describeEndpoint(params).promise();

            this.dataClient = new IotData({ endpoint: endpointAddress });
        }

        return this.dataClient;
    }

    private getTopicFor(event: DomainEvent): string | undefined {
        const topic = this.eventsInformation.composeIotTopic(event);

        return topic || this.config.fallbackTopic;
    }
}
