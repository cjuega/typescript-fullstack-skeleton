type ElasticsearchConfig = {
    url: string;
    username: string;
    password: string;
    caCertificate?: string;
    indices: string | string[];
};

export default ElasticsearchConfig;
