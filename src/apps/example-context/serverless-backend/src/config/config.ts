import { accessSync } from 'fs';
import { F_OK } from 'constants';
import convict from 'convict';
import { url } from 'convict-format-with-validator';

convict.addFormat(url);

convict.addFormat({
    name: 'array',
    validate(array, schema) {
        if (!Array.isArray(array)) {
            throw new Error('must be of type Array');
        }

        for (const item of array) {
            convict(schema.children).load(item).validate();
        }
    }
});

convict.addFormat({
    name: 'ddbonetable-indexes',
    validate(obj, schema) {
        console.log('validating ddbonetable-indexes...');
        console.log(obj);
        if (obj.constructor.name !== 'Object') {
            throw new Error('must be of type Array');
        }

        if (!obj.primary) {
            throw new Error('must describe a <primary> index');
        }

        for (const [_, value] of Object.entries(obj)) {
            convict(schema.children).load(value).validate();
        }
    }
});

const files = [`${__dirname}/default.json`],
    config = convict({
        env: {
            doc: 'The application environment.',
            format: ['pro', 'sta', 'test', 'dev', 'offline'],
            default: 'offline',
            env: 'NODE_ENV',
            arg: 'stage'
        },
        eventbridge: {
            region: {
                doc: 'Optional AWS region to setup EventBridge client.',
                format: String,
                default: undefined,
                nullable: true,
                env: 'AWS_REGION'
            },
            endpoint: {
                doc: 'Optional endpoint to the EventBridge server.',
                format: 'url',
                default: undefined,
                nullable: true
            },
            enableTracing: {
                doc: 'Optional flag that indicates whether AWS X-Ray traces are enabled.',
                format: Boolean,
                default: false,
                nullable: true
            },
            source: {
                docs: "Source used by the EventBridge's client when sending messages.",
                format: String,
                default: '',
                env: 'PROJECT'
            },
            eventBusName: {
                docs: 'Optional EventBridge bus name which the eventbridge client sends messages to.',
                format: String,
                default: undefined,
                nullable: true
            }
        },
        dynamodb: {
            region: {
                doc: 'Optional AWS region to setup dynamodb client.',
                format: String,
                default: undefined,
                nullable: true,
                env: 'AWS_REGION'
            },
            endpoint: {
                doc: 'Optional endpoint to the dynamodb server.',
                format: 'url',
                default: undefined,
                nullable: true
            },
            sslEnabled: {
                doc: 'Optional flag that indicates whether SSL is enabled.',
                format: Boolean,
                default: false,
                nullable: true
            },
            enableTracing: {
                doc: 'Optional flag that indicates whether AWS X-Ray traces are enabled.',
                format: Boolean,
                default: false,
                nullable: true
            }
        },
        ddbonetable: {
            tableName: {
                docs: 'Name of the DynamoDB table to connect to.',
                format: String,
                default: '',
                env: 'DYNAMODB_TABLENAME'
            },
            indexes: {
                format: Object,
                default: {}
            },
            models: {
                doc: "Optional flag that enables/disables DynamoDB One Table's logger.",
                format: 'array',
                default: [],
                children: {
                    doc: "Optional flag that enables/disables DynamoDB One Table's logger.",
                    format: String
                }
            },
            logger: {
                doc: "Optional flag that enables/disables DynamoDB One Table's logger.",
                format: Boolean,
                default: false,
                nullable: true
            },
            isoDates: {
                doc: 'Set to true to store dates as Javascript ISO strings vs epoch numerics.',
                format: Boolean,
                default: false,
                nullable: true
            }
        }
    });

try {
    const env = config.get('env');

    accessSync(`${__dirname}/${env}.json`, F_OK);
    files.push(`${__dirname}/${env}.json`);
    // eslint-disable-next-line no-empty
} catch {}

config.loadFile(files);

config.validate({ allowed: 'strict' });

export default config;
