import type Command from '@src/domain/commandBus/command';

export default class CommandNotRegisteredError extends Error {
    constructor(command: Command) {
        super(`The command <${command.constructor.name}> hasn't a command handler associated`);
    }
}
