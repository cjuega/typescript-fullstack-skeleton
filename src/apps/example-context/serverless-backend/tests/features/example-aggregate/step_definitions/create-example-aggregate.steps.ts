import { defineFeature, loadFeature } from 'jest-cucumber';
import { isOffline } from '@tests/features/shared/isOffline';
import {
    whenISendAPutRequest,
    thenTheResponseStatusCodeIs,
    andTheResponseBodyIsEmpty,
    andTheRequestIsOpenAPIValid
} from '@tests/features/shared/http';
import EnvironmentArranger from '@context/shared/infrastructure/arranger/environmentArranger';
import container from '@tests/config/dependency-injection';

const feature = loadFeature(
        'tests/features/example-aggregate/create-example-aggregate.feature',
        isOffline ? { tagFilter: 'not @exclude-offline' } : undefined
    ),
    environmentArranger: EnvironmentArranger = container.get('Tests.EnvironmentArranger');

defineFeature(feature, (test) => {
    beforeEach(async () => {
        await environmentArranger.arrange();
    });

    afterAll(async () => {
        await environmentArranger.close();
    });

    test('happy path', ({ when, then, and }) => {
        whenISendAPutRequest(when);
        andTheRequestIsOpenAPIValid(and);

        thenTheResponseStatusCodeIs(then);
        andTheResponseBodyIsEmpty(and);
    });
});
