import EventBridgeConfig from '@context/shared/infrastructure/eventBus/eventBridge/eventBridgeConfig';
import config from '@src/config/config';

export default class EventBrigeConfigFactory {
    static createConfig(): EventBridgeConfig {
        return config.get('eventbridge');
    }
}
