import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import type { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';
import type { EventBusConsumer } from '@src/domain/eventBus/eventBusConsumer';
import type RabbitmqConnection from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConnection';
import type { ConsumeMessage } from 'amqplib';

export default class RabbitmqEventBusConsumer implements EventBusConsumer {
    private readonly connection: RabbitmqConnection;

    private readonly subscribers: DomainEventSubscriber<DomainEvent>[];

    private readonly unmarshaller: DomainEventUnmarshaller;

    constructor(connection: RabbitmqConnection, subscribers: DomainEventSubscriber<DomainEvent>[], unmarshaller: DomainEventUnmarshaller) {
        this.connection = connection;
        this.subscribers = subscribers;
        this.unmarshaller = unmarshaller;
    }

    async start(): Promise<void> {
        await this.connection.connect();

        await Promise.all(this.subscribers.map((s) => this.connection.consume(s.name(), this.consume(s))));
    }

    private consume(subscriber: DomainEventSubscriber<DomainEvent>) {
        return async (message: ConsumeMessage): Promise<void> => {
            try {
                const event = this.unmarshaller.unmarshall(message.content.toString());

                await subscriber.on(event);
            } catch {
                // TODO: ignore errors from unmashalling as it means the service is not interested in the event
                await this.connection.handleError(message, subscriber.name());
            } finally {
                await this.connection.ack(message);
            }
        };
    }
}
