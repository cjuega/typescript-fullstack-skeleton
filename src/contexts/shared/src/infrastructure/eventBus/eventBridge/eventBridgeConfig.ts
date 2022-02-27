type EventBridgeConfig = {
    region?: string;
    endpoint?: string;
    enableTracing?: boolean;
    source: string;
    eventBusName?: string;
};

export default EventBridgeConfig;
