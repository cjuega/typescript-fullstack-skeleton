import RabbitmqConfig from '@src/infrastructure/eventBus/rabbitmq/rabbitmqConfig';
import {
    ConfirmChannel, Connection, ConsumeMessage, MessagePropertyHeaders, connect as rabbitConnect
} from 'amqplib';

export default class RabbitmqConnection {
    private static readonly RETRY_SUFFIX = '.retry';

    private static readonly DEADLETTER_SUFFIX = '.deadletter';

    private readonly config: RabbitmqConfig;

    private _connection?: Connection;

    private _channel?: ConfirmChannel;

    static retryName(name: string): string {
        return `${name}${RabbitmqConnection.RETRY_SUFFIX}`;
    }

    static deadLetterName(name: string): string {
        return `${name}${RabbitmqConnection.DEADLETTER_SUFFIX}`;
    }

    constructor(config: RabbitmqConfig) {
        this.config = config;
    }

    async setupExchange(exchangeName: string): Promise<void> {
        await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
    }

    async setupQueue(
        exchangeName: string,
        queueName: string,
        bindingKeys: string[],
        deadletterExchange?: string,
        deadletterQueue?: string,
        msgTtl?: number
    ): Promise<void> {
        await this.channel.assertQueue(queueName, {
            exclusive: false,
            durable: true,
            autoDelete: false,
            arguments: RabbitmqConnection.generateQueueArgs(deadletterExchange, deadletterQueue, msgTtl)
        });

        await Promise.all(bindingKeys.map((bindingKey) => this.channel.bindQueue(queueName, exchangeName, bindingKey)));
    }

    private static generateQueueArgs(deadletterExchange?: string, deadletterQueue?: string, msgTtl?: number): Record<string, unknown> {
        return {
            ...(deadletterExchange && { 'x-dead-letter-exchange': deadletterExchange }),
            ...(deadletterQueue && { 'x-dead-letter-routing-key': deadletterQueue }),
            ...(msgTtl && { 'x-message-ttl': msgTtl })
        };
    }

    private get connection(): Connection {
        if (!this._connection) {
            throw new Error('RabbitMQ connection not established');
        }

        return this._connection;
    }

    private get channel(): ConfirmChannel {
        if (!this._channel) {
            throw new Error('RabbitMQ channel not connected');
        }

        return this._channel;
    }

    async connect(): Promise<void> {
        if (!this._connection) {
            this._connection = await this.createConnection();
        }

        if (!this._channel) {
            this._channel = await this.createChannel();
        }
    }

    private async createConnection(): Promise<Connection> {
        const connection = await rabbitConnect({
            protocol: 'amqp',
            hostname: this.config.hostname,
            port: this.config.port,
            username: this.config.username,
            password: this.config.password,
            vhost: this.config.vhost
        });

        connection.on('error', (err) => {
            throw err;
        });

        return connection;
    }

    private async createChannel(): Promise<ConfirmChannel> {
        const channel = await this.connection.createConfirmChannel();
        await channel.prefetch(1);

        return channel;
    }

    async close(): Promise<void> {
        await this.channel.close();
        this._channel = undefined;

        await this.connection.close();
        this._connection = undefined;
    }

    async publish(
        exchange: string,
        routingKey: string,
        message: Buffer,
        options: { messageId: string; contentType: string; contentEncoding: string; priority?: number; headers?: unknown }
    ): Promise<void> {
        await this.connect();

        return new Promise((resolve, reject) => {
            this.channel.publish(exchange, routingKey, message, options, (err: Error) => (err ? reject(err) : resolve()));
        });
    }

    async consume(queueName: string, subscriber: (message: ConsumeMessage) => {}): Promise<void> {
        await this.channel.consume(queueName, (msg: ConsumeMessage | null) => {
            if (msg) {
                subscriber(msg);
            }
        });
    }

    async handleError(message: ConsumeMessage, queueName: string): Promise<void> {
        if (this.hasMaxRetriesReached(message)) {
            await this.publishToDeadletter(message, queueName);
        } else {
            await this.publishToRetry(message, queueName);
        }
    }

    private hasMaxRetriesReached(message: ConsumeMessage): boolean {
        if (this.config.maxRetries === undefined) {
            return false;
        }

        const count = message.properties.headers['redelivery-count'] as number;

        return count >= this.config.maxRetries;
    }

    private async publishToRetry(message: ConsumeMessage, queueName: string): Promise<void> {
        const options = RabbitmqConnection.generateMessageOptionsFromRedeliveredMessage(message);

        await this.publish(RabbitmqConnection.retryName(this.config.exchange), queueName, message.content, options);
    }

    private async publishToDeadletter(message: ConsumeMessage, queueName: string): Promise<void> {
        const options = RabbitmqConnection.generateMessageOptionsFromRedeliveredMessage(message);

        await this.publish(RabbitmqConnection.deadLetterName(this.config.exchange), queueName, message.content, options);
    }

    private static generateMessageOptionsFromRedeliveredMessage(message: ConsumeMessage): {
        messageId: string;
        contentType: string;
        contentEncoding: string;
        priority?: number;
        headers?: unknown;
    } {
        return {
            messageId: message.properties.messageId as string,
            headers: { ...message.properties.headers, ...RabbitmqConnection.incrementRedeliveryCount(message.properties.headers) },
            contentType: message.properties.contentType as string,
            contentEncoding: message.properties.contentEncoding as string,
            priority: message.properties.priority as number
        };
    }

    private static incrementRedeliveryCount(headers: MessagePropertyHeaders): Record<string, unknown> {
        const count = headers['redelivery-count'] as number;

        if (count) {
            return { 'redelivery-count': count + 1 };
        }

        return { 'redelivery-count': 1 };
    }

    async ack(message: ConsumeMessage): Promise<void> {
        this.channel.ack(message);
    }
}
