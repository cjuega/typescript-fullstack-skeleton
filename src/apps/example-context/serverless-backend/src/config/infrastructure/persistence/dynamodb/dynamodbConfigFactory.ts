import type DynamodbConfig from '@context/shared/infrastructure/persistence/dynamodb/dynamodbConfig';
import config from '@src/config/config';

export default class DynamodbConfigFactory {
    static createConfig(): DynamodbConfig {
        return config.get('dynamodb');
    }
}
