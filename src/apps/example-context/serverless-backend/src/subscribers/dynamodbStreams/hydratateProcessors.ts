import type DynamodbStreamProcessor from '@context/shared/infrastructure/persistence/dynamodb/dynamodbStreamProcessor';
import type { ContainerBuilder, Definition } from 'node-dependency-injection';

const hydratateProcessors = (container: ContainerBuilder): DynamodbStreamProcessor[] => {
    const processorDefinitions = container.findTaggedServiceIds('dynamodbStreamProcessor') as Map<string, Definition>,
        processors: DynamodbStreamProcessor[] = [];

    processorDefinitions.forEach((_: Definition, key: string) => {
        processors.push(container.get(key));
    });

    return processors;
};

export default hydratateProcessors;
