import Datetime from '@src/domain/datetime';

export interface Clock {
    now(): Datetime;
}
