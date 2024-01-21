type OpensearchConfig = {
    url: string;
    username?: string;
    password?: string;
    caCertificate?: string;
    aws?: { region: string; isAWSServerless?: boolean };
    indices: string | string[];
};

export default OpensearchConfig;
