import {
    andTheResponseBodyIsPackageVersion,
    andTheResponseIsOpenAPIValid,
    thenTheResponseStatusCodeIs,
    whenISendAGetRequest
} from '@tests/features/shared/http';
import { isOffline } from '@tests/features/shared/isOffline';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature(
    'tests/features/api/get-service-version.feature',
    isOffline ? { tagFilter: 'not @exclude-offline' } : undefined
);

defineFeature(feature, (test) => {
    test('requesting service version', ({ when, then, and }) => {
        whenISendAGetRequest(when);

        thenTheResponseStatusCodeIs(then);
        andTheResponseBodyIsPackageVersion(and);
        andTheResponseIsOpenAPIValid(and);
    });
});
