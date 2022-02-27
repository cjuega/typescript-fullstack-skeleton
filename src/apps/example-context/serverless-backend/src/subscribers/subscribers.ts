// eslint-disable-next-line import/no-unresolved
import { EventBridgeHandler } from 'aws-lambda';
import 'source-map-support/register';
import ConsoleLogger from '@context/shared/infrastructure/consoleLogger';
import CurrentTimeClock from '@context/shared/infrastructure/currentTimeClock';
import DomainEventJsonDeserializer from '@context/shared/infrastructure/eventBus/domainEventJsonDeserializer';
import InMemorySyncEventBus from '@context/shared/infrastructure/eventBus/inMemorySyncEventBus';

const logger = new ConsoleLogger(),
    clock = new CurrentTimeClock(),
    deserializer = new DomainEventJsonDeserializer(),
    eventBus = new InMemorySyncEventBus();

// eslint-disable-next-line one-var,import/prefer-default-export
export const on: EventBridgeHandler<string, Record<string, unknown>, void> = async (event) => {
    const domainEvents = [deserializer.deserialize(JSON.stringify(event.detail))];

    domainEvents.forEach((e) => {
        logger.debug(`${e.eventId}::${e.occurredOn.toISOString()}::${e.eventName}::${e.aggregateId} (processing at ${clock.now().value})`);
    });

    await eventBus.publish(domainEvents);
};
