import ObjectMother from '@src/domain/objectMother.mother';

export default class Repeater {
    static random<R>(callable: Function, iterations?: number): Array<R> {
        return Array(iterations !== undefined ? iterations : ObjectMother.zeroOrPositiveNumber(20))
            .fill({})
            .map(() => callable() as R);
    }
}
