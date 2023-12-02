import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { Schema, Type } from 'avsc';
import { readFileSync } from 'fs';

type Mapping = Map<string, Type>;

export interface DomainEventAvroPathPair<T extends DomainEvent> {
    schemaFor(): DomainEventName<T>;
    avroPath(): string;
}

export default class DomainEventAvroMapping {
    private schemas: Mapping;

    constructor(pairs: DomainEventAvroPathPair<DomainEvent>[]) {
        this.schemas = DomainEventAvroMapping.formatPairs(pairs);
    }

    private static formatPairs(pairs: DomainEventAvroPathPair<DomainEvent>[]): Mapping {
        const mappersMap = new Map<string, Type>();

        pairs.forEach((pair) => {
            const eventClass = pair.schemaFor();

            mappersMap.set(eventClass.eventName, DomainEventAvroMapping.loadSchema(pair.avroPath()));
        });

        return mappersMap;
    }

    private static loadSchema(path: string): Type {
        const schema = JSON.parse(readFileSync(path, 'utf8')) as Schema;

        return Type.forSchema(schema);
    }

    for(eventName: string): Type {
        const type = this.schemas.get(eventName);

        if (!type) {
            throw new Error(`No AVRO schema associated to event <${eventName}>`);
        }

        return type;
    }

    fromBuffer(buf: Buffer): unknown {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, type] of this.schemas) {
            try {
                const obj = type.fromBuffer(buf) as unknown;
                return obj;
            } catch (e) { /* empty */ }
        }

        throw new Error('No AVRO schema found for the given buffer');
    }
}
