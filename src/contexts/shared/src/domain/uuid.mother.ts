import ObjectMother from '@src/domain/objectMother.mother';

export default class UuidMother {
    static random(): string {
        return ObjectMother.uuid();
    }
}
