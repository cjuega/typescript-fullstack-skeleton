import { Clock } from '@src/domain/clock';
import Datetime from '@src/domain/datetime';

export default class CurrentTimeClock implements Clock {
    // eslint-disable-next-line class-methods-use-this
    now(): Datetime {
        return new Datetime();
    }
}
