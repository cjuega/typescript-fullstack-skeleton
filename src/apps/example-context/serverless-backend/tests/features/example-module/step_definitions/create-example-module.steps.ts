import { defineFeature, loadFeature } from 'jest-cucumber';
import { isOffline } from '@tests/features/shared/isOffline';
import { whenISendAPutRequest, thenTheResponseStatusCodeIs, andTheResponseBodyIsEmpty } from '@tests/features/shared/http';
import DynamodbDocClientFactory from '@context/shared/infrastructure/persistence/dynamodb/dynamodbDocClientFactory';
import DdbOneTableClientFactory from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableClientFactory';
import DdbOneTableEnvironmentArranger from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableEnvironmentArranger';

const feature = loadFeature(
        'tests/features/example-module/create-example-module.feature',
        isOffline ? { tagFilter: 'not @exclude-offline' } : undefined
    ),
    table = DdbOneTableClientFactory.createClient(
        'example-module',
        DynamodbDocClientFactory.createClient('example-module', {
            region: 'localhost',
            endpoint: 'http://localhost:8000',
            sslEnabled: false
        }),
        {
            tableName: 'db-integration-tests',
            indexes: { primary: { hash: 'pk', sort: 'sk' } },
            logger: true
        }
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

        thenTheResponseStatusCodeIs(then);
        andTheResponseBodyIsEmpty(and);
    });
});
