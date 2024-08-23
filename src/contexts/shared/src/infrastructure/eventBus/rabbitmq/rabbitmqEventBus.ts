import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import type { EventBus } from '@src/domain/eventBus/eventBus';
import type RabbitmqConfig from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConfig';
import type RabbitmqConnection from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConnection';

export default class RabbitmqEventBus implements EventBus {
    private readonly connection: RabbitmqConnection;

    private readonly marshaller: DomainEventMarshaller;

    private readonly config: RabbitmqConfig;

    constructor(connection: RabbitmqConnection, marshaller: DomainEventMarshaller, config: RabbitmqConfig) {
        this.connection = connection;
        this.marshaller = marshaller;
        this.config = config;
    }

    async publish(events: DomainEvent[]): Promise<void> {
        await Promise.all(
            events.map((event) => {
                const routingKey = event.eventName;

                let message = this.marshaller.marshall(event) as string | Buffer;
                if (!Buffer.isBuffer(message)) {
                    message = Buffer.from(message);
                }

                return this.connection.publish(this.config.exchange, routingKey, message, {
                    messageId: event.eventId,
                    contentType: 'application/json',
                    contentEncoding: 'utf-8'
                });
            })
        );
    }
}
