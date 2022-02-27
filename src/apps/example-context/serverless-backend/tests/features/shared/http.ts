import { DefineStepFunction } from 'jest-cucumber';
import request from 'supertest';
import { serverUrl } from '@tests/features/shared/isOffline';

let req: request.Request;
let response: request.Response;

async function iSendAGetRequest(route: string): Promise<void> {
    req = request(serverUrl).get(route);

    response = await req.send();
}

async function iSendAPutRequest(route: string, body: string): Promise<void> {
    req = request(serverUrl).put(route);

    response = await req.send(JSON.parse(body));
}

export const whenISendAGetRequest = (when: DefineStepFunction): void => {
        when(/I send a GET request to "(.+)"/, iSendAGetRequest);
    },
    whenISendAPutRequest = (when: DefineStepFunction): void => {
        when(/I send a PUT request to "(.+)" with body:/, iSendAPutRequest);
    },
    thenTheResponseStatusCodeIs = (then: DefineStepFunction): void => {
        then(/the response status code should be (\d+)/, (statusCode: string) => {
            expect(response.status).toBe(parseInt(statusCode, 10));
        });
    },
    andTheResponseBodyIs = (and: DefineStepFunction): void => {
        and(/the response body should be:/, (body: string) => {
            expect(response.body).toStrictEqual(JSON.parse(body));
        });
    },
    andTheResponseBodyIsEmpty = (and: DefineStepFunction): void => {
        and(/the response body should be empty/, () => {
            expect(response.body).toBe('');
        });
    };
