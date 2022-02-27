import { defineFeature, loadFeature } from 'jest-cucumber';
import { isOffline } from '@tests/features/shared/isOffline';
import { whenISendAPutRequest, thenTheResponseStatusCodeIs, andTheResponseBodyIsEmpty } from '@tests/features/shared/http';

const feature = loadFeature(
    'tests/features/example-module/create-example-module.feature',
    isOffline ? { tagFilter: 'not @exclude-offline' } : undefined
);

defineFeature(feature, (test) => {
    test('happy path', ({ when, then, and }) => {
        whenISendAPutRequest(when);

        thenTheResponseStatusCodeIs(then);
        andTheResponseBodyIsEmpty(and);
    });
});
