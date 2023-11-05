import { DescribeEndpointCommand, IoTClient } from '@aws-sdk/client-iot';
import { IoTDataPlaneClient, PublishCommand } from '@aws-sdk/client-iot-data-plane';
import { DomainEvent } from '@src/domain/eventBus/domainEvent';
import { EventBus } from '@src/domain/eventBus/eventBus';
import { Marshaller } from '@src/domain/eventBus/marshaller';
import IotCoreConfig from '@src/infrastructure/eventBus/iotCore/iotCoreConfig';
import IotCoreDomainEventsInformation from '@src/infrastructure/eventBus/iotCore/iotCoreDomainEventsInformation';

export default class IotCoreEventBus implements EventBus {
    private readonly iot: IoTClient;

    private readonly eventsInformation: IotCoreDomainEventsInformation;

    private readonly marshaller: Marshaller;

    private readonly config: IotCoreConfig;

    private dataClient: IoTDataPlaneClient | undefined;

    constructor(iot: IoTClient, eventsInformation: IotCoreDomainEventsInformation, marshaller: Marshaller, config: IotCoreConfig) {
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
                    const command = new PublishCommand({
                        topic: this.getTopicFor(event)!,
                        qos: 0,
                        payload: JSON.stringify(this.marshaller.marshall(event))
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
        const topic = this.eventsInformation.composeIotTopic(event);

        return topic || this.config.fallbackTopic;
    }
}
