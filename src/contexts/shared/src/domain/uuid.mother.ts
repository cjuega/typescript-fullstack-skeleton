import MotherCreator from '@src/domain/motherCreator.mother';

export default class UuidMother {
    static random(): string {
        return MotherCreator.uuid();
    }
}
