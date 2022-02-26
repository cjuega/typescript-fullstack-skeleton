export default abstract class StringValueObject {
    readonly value: string;

    constructor(value: string) {
        this.value = value;
    }

    toString(): string {
        return this.value;
    }

    equalsTo(other: StringValueObject): boolean {
        return this.value === other.value;
    }
}
