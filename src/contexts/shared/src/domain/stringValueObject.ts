import ValueObject from '@src/domain/valueObject';
import InvalidArgument from '@src/domain/invalidArgument';

export default abstract class StringValueObject extends ValueObject<string> {
    constructor(value: string) {
        const trimmed = value.trim();

        StringValueObject.ensureStringIsNotEmpty(trimmed);

        super(trimmed);
    }

    private static ensureStringIsNotEmpty(value: string): void {
        if (!value) {
            throw new InvalidArgument(`<${this.name}> doesn't allow empty strings`);
        }
    }
}
