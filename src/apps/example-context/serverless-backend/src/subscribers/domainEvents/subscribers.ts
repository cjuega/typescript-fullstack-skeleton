import type { EventBridgeHandler } from 'aws-lambda';
import 'source-map-support/register';
import type { Clock } from '@context/shared/domain/clock';
import type { DomainEventUnmarshaller } from '@context/shared/domain/eventBus/domainEventUnmarshaller';
import type { EventBus } from '@context/shared/domain/eventBus/eventBus';
import type { Logger } from '@context/shared/domain/logger';
import container from '@src/config/dependency-injection';
import registerSubscribers from '@src/subscribers/domainEvents/registerSubscribers';

const logger: Logger = container.get('Shared.Logger'),
    clock: Clock = container.get('Shared.Clock'),
    unmarshaller: DomainEventUnmarshaller = container.get('Shared.EventBus.EventMarshaller'),
    eventBus: EventBus = registerSubscribers(container);

export const on: EventBridgeHandler<string, Record<string, unknown>, void> = async (event) => {
    const domainEvents = [unmarshaller.unmarshall(JSON.stringify(event.detail))];

    for (const e of domainEvents) {
        logger.debug(`${e.eventId}::${e.occurredOn.toISOString()}::${e.eventName}::${e.aggregateId} (received at ${clock.now().value})`);
    }

    await eventBus.publish(domainEvents);
};
