type TypeormConfig = {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    migrations?: string[];
};

export default TypeormConfig;
