import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import { EventBus } from '@src/domain/eventBus/eventBus';
import RabbitmqConfig from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConfig';
import RabbitmqConnection from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConnection';

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
