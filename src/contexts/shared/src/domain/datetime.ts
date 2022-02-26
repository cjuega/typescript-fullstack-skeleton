import moment from 'moment';
import InvalidArgumentError from '@src/domain/invalidArgumentError';
import StringValueObject from '@src/domain/stringValueObject';

export default class Datetime extends StringValueObject {
    constructor(datetime?: string) {
        Datetime.ensureIsValidDate(datetime);

        super(moment(datetime).toISOString());
    }

    private static ensureIsValidDate(value?: string): void {
        const date = moment(value);

        if (!date.isValid()) {
            throw new InvalidArgumentError(`<${this.name}> doesn't allow the value <${value}>`);
        }
    }

    static clone(datetime: Datetime): Datetime {
        return new Datetime(datetime.value);
    }

    add(seconds: number): Datetime {
        const date = moment(this.value).add(seconds, 'seconds');

        return new Datetime(date.toISOString());
    }
}
