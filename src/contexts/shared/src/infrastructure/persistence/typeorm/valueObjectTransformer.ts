import type { NewableClass } from '@src/domain/newableClass';
import type ValueObject from '@src/domain/valueObject';
import type { Primitives } from '@src/domain/valueObject';

const ValueObjectTransformer = <T extends Primitives>(ValueObjectCtor: NewableClass<ValueObject<T>>) => ({
    to: (value: ValueObject<T>): T => value.value,
    from: (value: T): ValueObject<T> => new ValueObjectCtor(value)
});

export default ValueObjectTransformer;
