import { defineFeature, loadFeature } from 'jest-cucumber';
import { isOffline } from '@tests/features/shared/isOffline';
import {
    whenISendAPutRequest,
    thenTheResponseStatusCodeIs,
    andTheResponseBodyIsEmpty,
    andTheRequestIsOpenAPIValid
} from '@tests/features/shared/http';
import DynamodbDocClientFactory from '@context/shared/infrastructure/persistence/dynamodb/dynamodbDocClientFactory';
import DynamodbConfigFactory from '@src/config/infrastructure/persistence/dynamodb/dynamodbConfigFactory';
import DdbOneTableClientFactory from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableClientFactory';
import DdbOneTableConfigFactory from '@src/config/infrastructure/persistence/ddbOneTable/ddbOneTableConfigFactory';
import DdbOneTableEnvironmentArranger from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableEnvironmentArranger';

const feature = loadFeature(
        'tests/features/example-aggregate/create-example-aggregate.feature',
        isOffline ? { tagFilter: 'not @exclude-offline' } : undefined
    ),
    CONTEXT_NAME = 'example-context',
    table = DdbOneTableClientFactory.createClient(
        CONTEXT_NAME,
        DynamodbDocClientFactory.createClient(CONTEXT_NAME, DynamodbConfigFactory.createConfig()),
        DdbOneTableConfigFactory.createConfig()
    ),
    environmentArranger = new DdbOneTableEnvironmentArranger(table);

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
