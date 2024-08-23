import InvalidArgument from '@src/domain/invalidArgument';

export type Primitives = string | number | boolean | Date;

export default abstract class ValueObject<T extends Primitives> {
    readonly value: T;

    constructor(value: T) {
        this.value = value;

        this.ensureValueIsDefined(value);
    }

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
