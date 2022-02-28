import { DefineStepFunction } from 'jest-cucumber';
import request from 'supertest';
import { serverUrl } from '@tests/features/shared/isOffline';
import { isOpenAPIValidRequest, isOpenAPIValidResponse } from '@tests/features/shared/docValidation';
import { version } from '../../../package.json';

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
    },
    andTheResponseBodyIsPackageVersion = (and: DefineStepFunction): void => {
        and(/the response body should indicate the version of package.json/, () => {
            expect(response.body).toStrictEqual({ version });
        });
    },
    andTheRequestIsOpenAPIValid = (and: DefineStepFunction): void => {
        and(
            /the request is valid according to OpenAPI "(.+)" with path "(.+)"/,
            async (pathToOpenAPIFile: string, pathToRoute: string) => {
                const isValid = await isOpenAPIValidRequest(
                    pathToOpenAPIFile,
                    pathToRoute,
                    req.method,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    req.header['Content-Type'],
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // eslint-disable-next-line no-underscore-dangle
                    req._data
                );

                expect(isValid).toBe(true);
            }
        );
    },
    andTheResponseIsOpenAPIValid = (and: DefineStepFunction): void => {
        and(
            /the response is valid according to OpenAPI "(.+)" with path "(.+)"/,
            async (pathToOpenAPIFile: string, pathToRoute: string) => {
                const isValid = await isOpenAPIValidResponse(
                    pathToOpenAPIFile,
                    pathToRoute,
                    req.method,
                    `${response.status}`,
                    response.type,
                    response.body
                );

                expect(isValid).toBe(true);
            }
        );
    };
