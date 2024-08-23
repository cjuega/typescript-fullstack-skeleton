import type { Clock } from '@src/domain/clock';
import type Datetime from '@src/domain/datetime';

export default class ClockMock implements Clock {
    private mockNow = jest.fn<Datetime, void[], ClockMock>();

    now(): Datetime {
        return this.mockNow();
    }

    whenNowThenReturn(datetime: Datetime): void {
        this.mockNow.mockReturnValue(datetime);
    }
}
