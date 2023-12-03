type DdbOneTableConfig = {
    tableName: string;
    indexes: { [key: string]: { hash?: string; sort?: string; follow?: boolean; type?: 'local' } };
    models?: string[];
    isoDates?: boolean;
};

export default DdbOneTableConfig;
