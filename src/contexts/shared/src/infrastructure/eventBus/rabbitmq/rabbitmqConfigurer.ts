import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import type RabbitmqConfig from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConfig';
import RabbitmqConnection from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConnection';

interface QueueBindingKeys {
    queueName: string;
    bindingKeys: string[];
}

export interface RabbitmqConfigurerOptions {
    retryDelay: number;
}

export default class RabbitmqConfigurer {
    private readonly connection: RabbitmqConnection;

    private readonly queues: QueueBindingKeys[];

    private readonly config: RabbitmqConfig;

    private readonly options: RabbitmqConfigurerOptions;

    constructor(
        connection: RabbitmqConnection,
        subscribers: DomainEventSubscriber<DomainEvent>[],
        config: RabbitmqConfig,
        options: RabbitmqConfigurerOptions
    ) {
        this.connection = connection;
        this.queues = subscribers.map((s) => ({ queueName: s.name(), bindingKeys: s.subscribedTo().map(({ eventName }) => eventName) }));
        this.config = config;
        this.options = options;
    }

    async configure(): Promise<void> {
        await this.connection.connect();

        await this.connection.setupExchange(this.config.exchange);
        await this.connection.setupExchange(RabbitmqConnection.retryName(this.config.exchange));
        await this.connection.setupExchange(RabbitmqConnection.deadLetterName(this.config.exchange));

        await Promise.all(this.queues.map((q) => this.setupQueue(q)));

        await this.connection.close();
    }

    private async setupQueue(queue: QueueBindingKeys): Promise<void> {
        await this.connection.setupQueue(this.config.exchange, queue.queueName, [...queue.bindingKeys, queue.queueName]);

        await this.connection.setupQueue(
            RabbitmqConnection.retryName(this.config.exchange),
            RabbitmqConnection.retryName(queue.queueName),
            [queue.queueName],
            this.config.exchange,
            queue.queueName,
            this.options.retryDelay
        );

        await this.connection.setupQueue(
            RabbitmqConnection.deadLetterName(this.config.exchange),
            RabbitmqConnection.deadLetterName(queue.queueName),
            [queue.queueName]
        );
    }
}
