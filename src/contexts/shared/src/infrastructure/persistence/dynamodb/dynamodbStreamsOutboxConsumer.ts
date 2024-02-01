import { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';
import { EventBus } from '@src/domain/eventBus/eventBus';
// eslint-disable-next-line import/no-unresolved
import { DynamoDBRecord } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import DynamodbStreamProcessor from '@src/infrastructure/persistence/dynamodb/dynamodbStreamProcessor';

export default class DynamodbStreamsOutboxConsumer extends DynamodbStreamProcessor {
    private readonly unmarshaller: DomainEventUnmarshaller;

    private readonly eventBus: EventBus;

    private readonly partitionPrefix: string;

    constructor(unmarshaller: DomainEventUnmarshaller, eventBus: EventBus, config: { partitionPrefix: string }) {
        super();

        this.unmarshaller = unmarshaller;
        this.eventBus = eventBus;
        this.partitionPrefix = config.partitionPrefix;
    }

    // eslint-disable-next-line class-methods-use-this
    protected filter(records: DynamoDBRecord[]): DynamoDBRecord[] {
        return records.filter(
            ({ eventName, dynamodb }) => eventName === 'INSERT' && dynamodb?.NewImage?.pk?.S?.startsWith(this.partitionPrefix)
        );
    }

    protected async processRecords(records: DynamoDBRecord[]): Promise<void> {
        await this.consume(records);
    }

    private async consume(records: DynamoDBRecord[]): Promise<void> {
        const events = records
            .filter(({ dynamodb }) => !!dynamodb?.NewImage)
            .map(({ dynamodb }) => {
                const { payload } = unmarshall(dynamodb?.NewImage as Record<string, AttributeValue>);

                return this.unmarshaller.unmarshall(payload);
            })
            .filter((event) => !!event);

        if (events.length === 0) {
            return;
        }

        await this.eventBus.publish(events);
    }
}
