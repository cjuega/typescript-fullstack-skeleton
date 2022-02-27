import EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';

export default class EnvironmentMultiArranger extends EnvironmentArranger {
    private arrangers: EnvironmentArranger[];

    constructor(...arrangers: EnvironmentArranger[]) {
        super();

        this.arrangers = arrangers;
    }

    async arrange(): Promise<void> {
        await Promise.all(this.arrangers.map((arranger) => arranger.arrange()));
    }

    async close(): Promise<void> {
        await Promise.all(this.arrangers.map((arranger) => arranger.close()));
    }
}
