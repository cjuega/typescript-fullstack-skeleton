type TypeormConfig = {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    entities?: string[];
    subscribers?: string[];
    migrations?: string[];
};

export default TypeormConfig;
