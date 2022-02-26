import { Clock } from '@src/domain/clock';
import Datetime from '@src/domain/datetime';

export default class ClockMock implements Clock {
    private mockNow = jest.fn();

    now(): Datetime {
        return this.mockNow();
    }

    whenNowThenReturn(datetime: Datetime): void {
        this.mockNow.mockReturnValue(datetime);
    }
}
