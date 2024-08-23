import InvalidArgument from '@src/domain/invalidArgument';
import StringValueObject from '@src/domain/stringValueObject';
import moment from 'moment';

export default class Datetime extends StringValueObject {
    constructor(datetime?: string) {
        Datetime.ensureIsValidDate(datetime);

        super(moment(datetime).toISOString());
    }

    private static ensureIsValidDate(value?: string): void {
        const date = moment(value);

        if (!date.isValid()) {
            throw new InvalidArgument(`<${Datetime.name}> doesn't allow the value <${value}>`);
        }
    }

    add(seconds: number): Datetime {
        const date = moment(this.value).add(seconds, 'seconds');

        return new Datetime(date.toISOString());
    }
}
