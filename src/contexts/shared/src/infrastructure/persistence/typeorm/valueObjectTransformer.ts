import { NewableClass } from '@src/domain/newableClass';
import ValueObject, { Primitives } from '@src/domain/valueObject';

const ValueObjectTransformer = <T extends Primitives>(ValueObjectCtor: NewableClass<ValueObject<T>>) => ({
    to: (value: ValueObject<T>): T => value.value,
    from: (value: T): ValueObject<T> => new ValueObjectCtor(value)
});

export default ValueObjectTransformer;
