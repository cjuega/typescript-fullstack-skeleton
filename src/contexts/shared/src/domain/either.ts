export type Left<T> = { readonly tag: 'left'; readonly value: T };

export type Right<T> = { readonly tag: 'right'; readonly value: T };

export type Either<L, R> = Left<L> | Right<R>;

export const Right = <T>(value: T): Right<T> => ({
        tag: 'right',
        value
    }),
    Left = <T>(value: T): Left<T> => ({
        tag: 'left',
        value
    }),
    isRight = <L, R>(input: Either<L, R>): input is Right<R> => input.tag === 'right',
    isLeft = <L, R>(input: Either<L, R>): input is Left<L> => input.tag === 'left',
    match = <T, L, R>(input: Either<L, R>, left: (l: L) => T, right: (r: R) => T): T => {
        if (isLeft(input)) {
            return left(input.value);
        }

        return right(input.value);
    },
    map = <L, R, B>(input: Either<L, R>, mapper: (r: R) => B): Either<L, B> => match(
        input,
        (left): Either<L, B> => Left(left),
        (right): Either<L, B> => Right(mapper(right))
    ),
    flatMap = <L, R, B>(input: Either<L, R>, mapper: (r: R) => Either<L, B>): Either<L, B> => match(
        input,
        (left) => Left(left),
        (right) => mapper(right)
    );
