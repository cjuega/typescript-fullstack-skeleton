export type PartialDeep<T> = {
    [P in keyof T]?: PartialDeep<T[P]>;
};
