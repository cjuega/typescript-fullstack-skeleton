import { defineFeature, loadFeature } from 'jest-cucumber';
import { isOffline } from '@tests/features/shared/isOffline';
import { whenISendAGetRequest, thenTheResponseStatusCodeIs, andTheResponseBodyIs } from '@tests/features/shared/http';

const feature = loadFeature(
    'tests/features/api/get-service-version.feature',
    isOffline ? { tagFilter: 'not @exclude-offline' } : undefined
);

defineFeature(feature, (test) => {
    test('requesting service version', ({ when, then, and }) => {
        whenISendAGetRequest(when);

        thenTheResponseStatusCodeIs(then);
        andTheResponseBodyIs(and);
    });
});
