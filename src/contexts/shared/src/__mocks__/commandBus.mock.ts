import MotherCreator from '@src/domain/motherCreator.mother';
import Command from '@src/domain/commandBus/command';
import { CommandBus } from '@src/domain/commandBus/commandBus';

export default class CommandBusMock implements CommandBus {
    private mockDispatch = jest.fn();

    async dispatch(command: Command): Promise<void> {
        await this.mockDispatch(command);
    }

    whenDispatchThenThrow(error: Error): void {
        this.mockDispatch.mockRejectedValue(error);
    }

    whenDispatchThenThrowRandomly(error: Error): void {
        this.mockDispatch.mockImplementation(() => {
            const shouldFail = MotherCreator.boolean();

            if (shouldFail) {
                return Promise.reject(error);
            }

            return Promise.resolve();
        });
    }

    assertLastDispatchedCommandIs(command: Command): void {
        expect(this.mockDispatch).toHaveBeenLastCalledWith(command);
    }

    assertDispatchedCommandsAre(commands: Array<Command>): void {
        const { mock } = this.mockDispatch;

        commands.forEach((command: Command, i: number) => {
            const commandCall = mock.calls[i][0];
            expect(commandCall).toStrictEqual(command);
        });
        expect(this.mockDispatch).toHaveBeenCalledTimes(commands.length);
    }

    assertNothingDispatched(): void {
        expect(this.mockDispatch).not.toHaveBeenCalled();
    }
}
