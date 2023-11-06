// eslint-disable-next-line import/no-unresolved
import { EventBridgeHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Logger } from '@context/shared/domain/logger';
import { Clock } from '@context/shared/domain/clock';
import DomainEventJsonDeserializer from '@context/shared/infrastructure/eventBus/domainEventJsonDeserializer';
import { EventBus } from '@context/shared/domain/eventBus/eventBus';
import container from '@src/config/dependency-injection';
import registerSubscribers from '@src/subscribers/registerSubscribers';

const logger: Logger = container.get('Shared.Logger'),
    clock: Clock = container.get('Shared.Clock'),
    deserializer: DomainEventJsonDeserializer = container.get('Shared.EventBus.DomainEventJsonDeserializer'),
    eventBus: EventBus = registerSubscribers(container);

// eslint-disable-next-line one-var,import/prefer-default-export
export const on: EventBridgeHandler<string, Record<string, unknown>, void> = async (event) => {
    const domainEvents = [deserializer.deserialize(JSON.stringify(event.detail))];

    domainEvents.forEach((e) => {
        logger.debug(`${e.eventId}::${e.occurredOn.toISOString()}::${e.eventName}::${e.aggregateId} (processing at ${clock.now().value})`);
    });

    await eventBus.publish(domainEvents);
};
