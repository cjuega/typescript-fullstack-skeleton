declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValid(expected: string): R;
        }
    }
}

export type {};
