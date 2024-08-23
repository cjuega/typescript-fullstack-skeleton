import { readFileSync } from 'node:fs';
import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { type Schema, Type } from 'avsc';

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
        return pairs.reduce(
            (map, pair) => map.set(pair.schemaFor().eventName, DomainEventAvroMapping.loadSchema(pair.avroPath())),
            new Map<string, Type>()
        );
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
        for (const [_, type] of this.schemas) {
            try {
                const obj = type.fromBuffer(buf) as unknown;
                return obj;
            } catch {
                /* empty */
            }
        }

        throw new Error('No AVRO schema found for the given buffer');
    }
}
