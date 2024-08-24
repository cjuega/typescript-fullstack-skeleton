import { readFile } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { load } from 'js-yaml';

expect.extend({
    toBeValid(isValid, errorMessage) {
        return {
            message: () => (isValid ? '' : errorMessage),
            pass: isValid
        };
    }
});

const appFolder = resolve(__dirname, '../../../'),
    readFileAsync = promisify(readFile);

async function readSchema(filepath: string): Promise<any> {
    const fileContent = await readFileAsync(filepath, 'utf8');

    return load(fileContent);
}

function getValidator(): Ajv {
    // @ts-ignore
    const ajv = new Ajv({ allErrors: true, verbose: true });

    addFormats(ajv);

    // Add Swagger's specific fields that aren't supported by Ajv
    ajv.addFormat('password', () => true);
    ajv.addKeyword('example');

    return ajv;
}

function isValidAgainstSchema(schema: Record<string, any>, obj: Record<string, unknown> | undefined | null): void {
    const ajv = getValidator(),
        isValid = ajv.validate(schema, obj),
        errorMessage = (ajv.errors || [])
            .map((error) => {
                const { instancePath, data, message, params } = error;
                return instancePath
                    ? `<${instancePath} = ${data}> ${message} (${JSON.stringify(params)})`
                    : `<${JSON.stringify(data)}> ${message} (${JSON.stringify(params)})`;
            })
            .join('\n');

    expect(isValid).toBeValid(errorMessage);
}

function paramsToAjvSchema(params: Array<{ name: string; required?: boolean; schema: any }>): any {
    return params.reduce(
        (schema: any, param) => {
            const paramName = param.name.toLowerCase();

            schema.properties[paramName] = param.schema;

            if (param.required) {
                if (!schema.required) {
                    schema.required = [];
                }

                schema.required.push(paramName);
            }

            return schema;
        },
        {
            type: 'object',
            properties: {},
            additionalProperties: false
        }
    );
}

function areRequestHeadersValid(headersSchema: any, headers: any): void {
    // Add Content-Type header to schema
    headersSchema.properties['content-type'] = { type: 'string' };

    const lowercaseHeaders = Object.entries(headers).reduce((h: any, [k, v]) => {
        h[k.toLowerCase()] = v;
        return h;
    }, {});

    isValidAgainstSchema(headersSchema, lowercaseHeaders);
}

function areRequestPathParamsValid(pathSchema: any, pathParams: any): void {
    isValidAgainstSchema(pathSchema, pathParams);
}

function areRequestQueryParamsValid(querySchema: any, queryParams: any): void {
    isValidAgainstSchema(querySchema, queryParams);
}

function isRequestBodyValid(bodySchema: any, body: any): void {
    if (bodySchema && !body) {
        expect(body).toBeDefined();
    }

    if (!bodySchema && !!body) {
        expect(body).toBeUndefined();
    }

    isValidAgainstSchema(bodySchema, body);
}

export const isRequestOpenAPIValid = async (
        filepath: string,
        pathToRoute: string,
        httpVerb: string,
        contentType: string,
        headers: { [key: string]: string },
        pathParams: { [key: string]: string },
        queryParams: { [key: string]: string },
        body: Record<string, unknown> | undefined | null
    ): Promise<void> => {
        const schema = await readSchema(join(appFolder, filepath)),
            pathSchema = schema.paths[pathToRoute],
            methodSchema = pathSchema?.[httpVerb.toLowerCase()],
            parametersSchema = methodSchema?.parameters || [],
            bodySchema = methodSchema?.requestBody?.content[contentType]?.schema;

        expect(methodSchema).toBeDefined();

        areRequestHeadersValid(paramsToAjvSchema(parametersSchema.filter((p: any) => p.in === 'header')), headers);

        areRequestPathParamsValid(paramsToAjvSchema(parametersSchema.filter((p: any) => p.in === 'path')), pathParams);

        areRequestQueryParamsValid(paramsToAjvSchema(parametersSchema.filter((p: any) => p.in === 'query')), queryParams);

        isRequestBodyValid(bodySchema, body);
    },
    isResponseOpenAPIValid = async (
        filepath: string,
        pathToRoute: string,
        httpVerb: string,
        responseCode: string,
        contentType: string,
        response: Record<string, unknown>
    ): Promise<void> => {
        const schema = await readSchema(join(appFolder, filepath)),
            pathSchema = schema.paths[pathToRoute],
            methodSchema = pathSchema?.[httpVerb.toLowerCase()],
            responseSchema = methodSchema?.responses[responseCode]?.content[contentType]?.schema;

        expect(pathSchema).toBeDefined();
        expect(methodSchema).toBeDefined();
        expect(methodSchema.responses[responseCode]).toBeDefined();

        if (responseSchema && !response) {
            expect(response).toBeDefined();
        }

        if (!responseSchema && !!response) {
            expect(response).toBeUndefined();
        }

        isValidAgainstSchema(responseSchema, response);
    };
