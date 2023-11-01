import { faker } from '@faker-js/faker';

export default class MotherCreator {
    static uuid(): string {
        return faker.string.uuid();
    }

    static indexNumber(max: number): number {
        return faker.number.int({ min: 0, max });
    }

    static words(): string {
        return faker.lorem.words();
    }

    static boolean(): boolean {
        return faker.datatype.boolean();
    }

    static positiveNumber(max?: number): number {
        return faker.number.int({ min: 1, max });
    }

    static zeroOrPositiveNumber(max?: number): number {
        return faker.number.int({ min: 0, max });
    }

    static email(): string {
        return faker.internet.email();
    }

    static spanishPhoneNumber(): string {
        const format = MotherCreator.boolean() ? '91#######' : '6########';

        return faker.phone.number(format);
    }

    static text(): string {
        return faker.lorem.paragraph();
    }

    static recentDate(): Date {
        return faker.date.recent();
    }
}
