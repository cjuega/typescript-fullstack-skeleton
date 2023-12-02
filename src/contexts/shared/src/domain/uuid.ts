import { randomUUID } from 'crypto';
import validate from 'uuid-validate';
import InvalidArgument from '@src/domain/invalidArgument';
import ValueObject from '@src/domain/valueObject';

export default class Uuid extends ValueObject<string> {
    constructor(value: string) {
        super(value);

        this.ensureIsValidUuid(value);
    }

    static random(): Uuid {
        return new Uuid(randomUUID());
    }

    private ensureIsValidUuid(id: string): void {
        if (!validate(id)) {
            throw new InvalidArgument(`<${this.constructor.name}> does not allow the value <${id}>`);
        }
    }
}
