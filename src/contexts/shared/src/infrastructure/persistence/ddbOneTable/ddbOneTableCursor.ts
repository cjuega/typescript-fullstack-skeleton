import InvalidArgument from '@src/domain/invalidArgument';

type DdbOneTableCursor = { prev: object } | { next: object } | undefined;

export const decryptDdbOneTableCursor = (cursor?: string): DdbOneTableCursor => {
        if (!cursor) {
            return undefined;
        }

        try {
            return JSON.parse(Buffer.from(cursor, 'base64').toString());
        } catch (e) {
            throw new InvalidArgument(`cursor <${cursor}> can't be read.`);
        }
    },
    encryptDdbOneTableCursor = (obj: object | undefined, isBackward: boolean): string | null => {
        if (!obj) {
            return null;
        }

        return Buffer.from(JSON.stringify(isBackward ? { prev: obj } : { next: obj })).toString('base64');
    };
