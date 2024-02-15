import Datetime from '@src/domain/datetime';
import ObjectMother from '@src/domain/objectMother.mother';

export default class DatetimeMother {
    static create(datetime?: string): Datetime {
        return new Datetime(datetime);
    }

    static random(): Datetime {
        const date = ObjectMother.recentDate();

        return DatetimeMother.create(date.toISOString());
    }
}
