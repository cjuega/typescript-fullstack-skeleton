import type { Clock } from '@src/domain/clock';
import Datetime from '@src/domain/datetime';

export default class CurrentTimeClock implements Clock {
    now(): Datetime {
        return new Datetime();
    }
}
