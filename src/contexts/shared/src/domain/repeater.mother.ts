import MotherCreator from '@src/domain/motherCreator.mother';

export default class Repeater {
    // eslint-disable-next-line @typescript-eslint/ban-types
    static random(callable: Function, iterations?: number): Array<any> {
        return Array(iterations !== undefined ? iterations : MotherCreator.zeroOrPositiveNumber(20))
            .fill({})
            .map(() => callable());
    }
}
