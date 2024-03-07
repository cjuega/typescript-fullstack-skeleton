/* eslint-disable no-underscore-dangle */
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
        this._connection = await this.createConnection();
        this._channel = await this.createChannel();
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
        await this.connection.close();
    }

    async publish(
        exchange: string,
        routingKey: string,
        message: Buffer,
        options: { messageId: string; contentType: string; contentEncoding: string; priority?: number; headers?: unknown }
    ): Promise<void> {
        if (!this._channel) {
            await this.connect();
        }

        return new Promise((resolve, reject) => {
            this.channel.publish(exchange, routingKey, message, options, (err: Error) => (err ? reject(err) : resolve()));
        });
    }
}
