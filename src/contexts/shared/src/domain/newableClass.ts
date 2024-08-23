// biome-ignore lint/complexity/noBannedTypes: <explanation>
export interface NewableClass<T> extends Function {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    new (...args: any[]): T;
}
