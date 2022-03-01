import { readFile } from 'fs';
import { join, resolve } from 'path';
import { load } from 'js-yaml';
import { promisify } from 'util';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ajv = new Ajv({ allErrors: true, verbose: true });

    addFormats(ajv);

    // Add Swagger's specific fields that aren't supported by Ajv
    ajv.addFormat('password', () => true);
    ajv.addKeyword('example');

    return ajv;
}

async function isValidAgainstSchema(schema: Record<string, any>, obj: Record<string, unknown> | undefined | null): Promise<boolean> {
    const ajv = getValidator(),
        isValid = ajv.validate(schema, obj),
        errorMessage = (ajv.errors || [])
            .map((error) => {
                const {
                    instancePath, data, message, params
                } = error;
                return instancePath
                    ? `<${instancePath} = ${data}> ${message} (${JSON.stringify(params)})`
                    : `<${JSON.stringify(data)}> ${message} (${JSON.stringify(params)})`;
            })
            .join('\n');

    expect(isValid).toBeValid(errorMessage);

    return isValid;
}

// eslint-disable-next-line one-var
export const isOpenAPIValidRequest = async (
        filepath: string,
        pathToRoute: string,
        httpVerb: string,
        contentType: string,
        headers: { [key: string]: string },
        queryParams: { [key: string]: string },
        body: Record<string, unknown> | undefined | null
    ): Promise<boolean> => {
        console.log(headers);
        console.log(queryParams);

        const schema = await readSchema(join(appFolder, filepath)),
            pathSchema = schema.paths[pathToRoute],
            methodSchema = pathSchema && pathSchema[httpVerb.toLowerCase()],
            bodySchema = methodSchema?.requestBody?.content[contentType]?.schema;

        if (!methodSchema) {
            return false;
        }

        if ((bodySchema && !body) || (!bodySchema && !!body)) {
            return false;
        }

        return isValidAgainstSchema(bodySchema, body);
    },
    isOpenAPIValidResponse = async (
        filepath: string,
        pathToRoute: string,
        httpVerb: string,
        responseCode: string,
        contentType: string,
        response: Record<string, unknown>
    ): Promise<boolean> => {
        const schema = await readSchema(join(appFolder, filepath)),
            pathSchema = schema.paths[pathToRoute],
            methodSchema = pathSchema && pathSchema[httpVerb.toLowerCase()],
            responseSchema = methodSchema?.responses[responseCode]?.content[contentType]?.schema;

        if (!pathSchema) {
            return false;
        }

        if (!methodSchema) {
            return false;
        }

        if (!methodSchema?.responses[responseCode]) {
            return false;
        }

        if ((responseSchema && !response) || (!responseSchema && !!response)) {
            return false;
        }

        return isValidAgainstSchema(responseSchema, response);
    };
