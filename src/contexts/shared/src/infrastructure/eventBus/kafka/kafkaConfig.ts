type KafkaConfig = {
    clientId: string;
    brokers: string[];
    groupId: string;
    topicsToListen?: Array<{ topic: string; fromBeggining?: boolean }>;
};

export default KafkaConfig;
