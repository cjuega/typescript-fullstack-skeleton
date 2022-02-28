import DdbOneTableConfig from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableConfig';
import config from '@src/config/config';

export default class DdbOneTableConfigFactory {
    static createConfig(): DdbOneTableConfig {
        return config.get('ddbonetable');
    }
}
