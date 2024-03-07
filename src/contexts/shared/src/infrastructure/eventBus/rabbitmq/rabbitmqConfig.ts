type RabbitmqConfig = {
    hostname: string;
    port: number;
    username: string;
    password: string;
    exchange: string;
    vhost?: string;
    maxRetries?: number;
};

export default RabbitmqConfig;
