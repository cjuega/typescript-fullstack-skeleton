import ValueObject from '@src/domain/valueObject';

export default abstract class NumberValueObject extends ValueObject<number> {
    isBiggerThan(other: NumberValueObject): boolean {
        return this.value > other.value;
    }
}
