type IotCoreConfig = {
    region?: string;
    endpoint?: string;
    enableTracing?: boolean;
    topicPrefix?: string;
    fallbackTopic?: string;
};

export default IotCoreConfig;
