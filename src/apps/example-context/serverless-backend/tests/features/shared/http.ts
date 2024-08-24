import { isRequestOpenAPIValid, isResponseOpenAPIValid } from '@tests/features/shared/docValidation';
import { serverUrl } from '@tests/features/shared/isOffline';
import type { DefineStepFunction } from 'jest-cucumber';
import request from 'supertest';
import { version } from '../../../package.json';

let req: request.Request;
let response: request.Response;

async function iSendAGetRequest(route: string): Promise<void> {
    req = request(serverUrl).get(route);

    response = await req.send();
}

async function iSendAPutRequest(route: string, body: string): Promise<void> {
    req = request(serverUrl).put(route);

    response = await req.send(JSON.parse(body) as object);
}

function extractPathParams(url: string, docPath: string): { [key: string]: string } {
    const pathParamNames = docPath.match(/{([a-zA-Z]+)}/g),
        pathParamsValues = url.match(new RegExp(docPath.replace(/{[a-zA-Z]+}/g, '([a-zA-Z0-9-_]+)')));

    pathParamsValues?.shift();

    if (!pathParamNames) {
        return {};
    }

    return pathParamNames.reduce((params: { [key: string]: string }, name, i) => {
        const nameWithoutBrackets = name.substring(1, name.length - 1);

        params[nameWithoutBrackets] = pathParamsValues![i];

        return params;
    }, {});
}

function extractQueryParams(url: string): { [key: string]: string } {
    const { searchParams } = new URL(url),
        queryParams: { [key: string]: string } = {};

    searchParams.forEach((value, key) => {
        queryParams[key] = value;
    });

    return queryParams;
}

export const whenISendAGetRequest = (when: DefineStepFunction): void => {
        when(/I send a GET request to "(.+)"/, iSendAGetRequest);
    },
    whenISendAPutRequest = (when: DefineStepFunction): void => {
        when(/I send a PUT request to "(.+)" with body:/, iSendAPutRequest);
    },
    thenTheResponseStatusCodeIs = (then: DefineStepFunction): void => {
        then(/the response status code should be (\d+)/, (statusCode: string) => {
            expect(response.status).toBe(Number.parseInt(statusCode, 10));
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
        and(/the request is valid according to OpenAPI "(.+)" with path "(.+)"/, async (pathToOpenAPIFile: string, pathToRoute: string) => {
            await isRequestOpenAPIValid(
                pathToOpenAPIFile,
                pathToRoute,
                req.method,
                // @ts-ignore
                req.header['Content-Type'],
                // @ts-ignore
                req.header,
                extractPathParams(req.url, pathToRoute),
                extractQueryParams(req.url),
                // @ts-ignore
                req._data
            );
        });
    },
    andTheResponseIsOpenAPIValid = (and: DefineStepFunction): void => {
        and(
            /the response is valid according to OpenAPI "(.+)" with path "(.+)"/,
            async (pathToOpenAPIFile: string, pathToRoute: string) => {
                await isResponseOpenAPIValid(
                    pathToOpenAPIFile,
                    pathToRoute,
                    req.method,
                    `${response.status}`,
                    response.type,
                    response.body
                );
            }
        );
    };
