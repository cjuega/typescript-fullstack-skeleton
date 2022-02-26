import Query from '@src/domain/queryBus/query';
import { QueryBus } from '@src/domain/queryBus/queryBus';
import { Response } from '@src/domain/queryBus/response';
import { when } from 'jest-when';

export default class QueryBusMock implements QueryBus {
    private mockAsk = jest.fn();

    async ask<R extends Response>(query: Query): Promise<R> {
        return this.mockAsk(query);
    }

    whenAskThenReturn(response: Response): void {
        this.mockAsk.mockReturnValue(response);
    }

    whenAskThenReturnBasedOn(map: Map<any, any>): void {
        map.forEach((response, query) => {
            if (response instanceof Error) {
                when(this.mockAsk).calledWith(query).mockRejectedValue(response);
            } else {
                when(this.mockAsk).calledWith(query).mockReturnValue(response);
            }
        });
    }

    whenAskThenReturnValueOnce(response: Response): void {
        this.mockAsk.mockReturnValueOnce(response);
    }

    whenAskThenThrow(error: Error): void {
        this.mockAsk.mockRejectedValue(error);
    }

    assertAskHasBeenCalledWith(query: Query): void {
        expect(this.mockAsk).toHaveBeenLastCalledWith(query);
    }

    assertNothingAsked(): void {
        expect(this.mockAsk).not.toHaveBeenCalled();
    }
}
