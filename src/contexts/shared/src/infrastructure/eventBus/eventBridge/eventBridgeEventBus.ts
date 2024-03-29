import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import { EventBus } from '@src/domain/eventBus/eventBus';
import EventBridgeConfig from '@src/infrastructure/eventBus/eventBridge/eventBridgeConfig';
import { chunk } from 'lodash';

export default class EventBridgeEventBus implements EventBus {
    protected static MAX_ENTRIES_IN_PUT_EVENTS = 10;

    private readonly eventBridge: EventBridgeClient;

    private readonly marshaller: DomainEventMarshaller;

    private config: EventBridgeConfig;

    constructor(eventBridge: EventBridgeClient, marshaller: DomainEventMarshaller, config: EventBridgeConfig) {
        this.eventBridge = eventBridge;
        this.marshaller = marshaller;
        this.config = config;
    }

    protected client(): EventBridgeClient {
        return this.eventBridge;
    }

    async publish(events: DomainEvent[]): Promise<void> {
        if (!events.length) {
            return;
        }

        await Promise.all(chunk(events, EventBridgeEventBus.MAX_ENTRIES_IN_PUT_EVENTS).map((list) => this.publishToEventBridge(list)));
    }

    private async publishToEventBridge(events: DomainEvent[]): Promise<void> {
        const command = new PutEventsCommand({
            Entries: this.mapDomainEventsToEventBridgeEvents(events)
        });

        await this.client().send(command);
    }

    private mapDomainEventsToEventBridgeEvents(events: DomainEvent[]): PutEventsRequestEntry[] {
        return events.map((e) => ({
            Time: e.occurredOn,
            Source: this.config.source,
            EventBusName: this.config.eventBusName || undefined,
            DetailType: e.eventName,
            Detail: this.marshaller.marshall(e) as string
        }));
    }
}
