import { DescribeEndpointCommand, type IoTClient } from '@aws-sdk/client-iot';
import { IoTDataPlaneClient, PublishCommand } from '@aws-sdk/client-iot-data-plane';
import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import type { EventBus } from '@src/domain/eventBus/eventBus';
import type IotCoreConfig from '@src/infrastructure/eventBus/iotCore/iotCoreConfig';
import type IotCoreDomainEventsMapper from '@src/infrastructure/eventBus/iotCore/iotCoreDomainEventsMappers';

export default class IotCoreEventBus implements EventBus {
    private readonly iot: IoTClient;

    private readonly eventsMapper: IotCoreDomainEventsMapper;

    private readonly marshaller: DomainEventMarshaller;

    private readonly config: IotCoreConfig;

    private dataClient: IoTDataPlaneClient | undefined;

    constructor(iot: IoTClient, eventsInformation: IotCoreDomainEventsMapper, marshaller: DomainEventMarshaller, config: IotCoreConfig) {
        this.iot = iot;
        this.eventsMapper = eventsInformation;
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
                    const command = new PublishCommand({
                        topic: this.getTopicFor(event)!,
                        qos: 0,
                        payload: this.marshaller.marshall(event) as string
                    });

                    return client.send(command);
                })
        );
    }

    private async client(): Promise<IoTDataPlaneClient> {
        if (!this.dataClient) {
            const command = new DescribeEndpointCommand({
                    endpointType: 'iot:Data'
                }),
                { endpointAddress } = await this.iot.send(command);

            this.dataClient = new IoTDataPlaneClient({ endpoint: endpointAddress });
        }

        return this.dataClient;
    }

    private getTopicFor(event: DomainEvent): string | undefined {
        const topic = this.eventsMapper.composeIotTopic(event);

        return topic || this.config.fallbackTopic;
    }
}
