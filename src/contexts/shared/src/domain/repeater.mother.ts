import MotherCreator from '@src/domain/motherCreator.mother';

export default class Repeater {
    static random<R>(callable: Function, iterations?: number): Array<R> {
        return Array(iterations !== undefined ? iterations : MotherCreator.zeroOrPositiveNumber(20))
            .fill({})
            .map(() => callable() as R);
    }
}
