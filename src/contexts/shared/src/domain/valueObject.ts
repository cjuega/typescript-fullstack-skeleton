import InvalidArgument from '@src/domain/invalidArgument';

// eslint-disable-next-line @typescript-eslint/ban-types
type Primitives = String | string | number | Boolean | boolean | Date;

export default abstract class ValueObject<T extends Primitives> {
    readonly value: T;

    constructor(value: T) {
        this.value = value;

        this.ensureValueIsDefined(value);
    }

    // eslint-disable-next-line class-methods-use-this
    private ensureValueIsDefined(value: T): void {
        if (value === null || value === undefined) {
            throw new InvalidArgument('Value must be defined');
        }
    }

    equalsTo(other: ValueObject<T>): boolean {
        return other.constructor.name === this.constructor.name && other.value === this.value;
    }

    toString(): string {
        return this.value.toString();
    }
}
