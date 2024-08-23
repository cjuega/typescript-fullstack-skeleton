import type { DynamoDBRecord } from 'aws-lambda';

export default abstract class DynamodbStreamProcessor {
    protected abstract filter(records: DynamoDBRecord[]): DynamoDBRecord[];

    protected abstract processRecords(records: DynamoDBRecord[]): Promise<void>;

    async process(records: DynamoDBRecord[]): Promise<void> {
        await this.processRecords(this.filter(records));
    }
}
