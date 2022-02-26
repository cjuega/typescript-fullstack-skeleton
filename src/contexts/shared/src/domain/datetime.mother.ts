import Datetime from '@src/domain/datetime';
import MotherCreator from '@src/domain/motherCreator.mother';

export default class DatetimeMother {
    static create(datetime?: string): Datetime {
        return new Datetime(datetime);
    }

    static random(): Datetime {
        const date = MotherCreator.recentDate();

        return DatetimeMother.create(date.toISOString());
    }
}
