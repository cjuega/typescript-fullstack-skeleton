import { ContainerBuilder, Definition } from 'node-dependency-injection';
import DynamodbStreamProcessor from '@context/shared/infrastructure/persistence/dynamodb/dynamodbStreamProcessor';

const hydratateProcessors = (container: ContainerBuilder): DynamodbStreamProcessor[] => {
    const processorDefinitions = container.findTaggedServiceIds('dynamodbStreamProcessor') as Map<string, Definition>,
        processors: Array<DynamodbStreamProcessor> = [];

    processorDefinitions.forEach((_value: any, key: any) => {
        processors.push(container.get(key));
    });

    return processors;
};

export default hydratateProcessors;
