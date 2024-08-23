import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventName } from '@src/domain/eventBus/domainEventName';
import { type Type, load } from 'protobufjs';

type Mapping = Map<string, Type>;

export interface DomainEventProtobufPathPair<T extends DomainEvent> {
    schemaFor(): DomainEventName<T>;
    protoFilepath(): string;
    messagePath(): string;
}

export default class DomainEventProtobufMapping {
    private schemas: Mapping;

    constructor(pairs: DomainEventProtobufPathPair<DomainEvent>[]) {
        this.schemas = new Map<string, Type>();
        this.loadSchemas(pairs);
    }

    private loadSchemas(pairs: DomainEventProtobufPathPair<DomainEvent>[]): void {
        for (const p of pairs) {
            this.loadSchema(p);
        }
    }

    private loadSchema(pair: DomainEventProtobufPathPair<DomainEvent>): void {
        const eventClass = pair.schemaFor();

        load(pair.protoFilepath())
            .then((root) => {
                this.schemas.set(eventClass.eventName, root.lookupType(pair.messagePath()));
            })
            .catch((err) => {
                throw err;
            });
    }

    for(eventName: string): Type {
        const schema = this.schemas.get(eventName);

        if (!schema) {
            throw new Error(`No Protobuf schema associated to event <${eventName}>`);
        }

        return schema;
    }

    fromBuffer(buf: Buffer): unknown {
        for (const [_, schema] of this.schemas) {
            try {
                const obj = schema.decode(buf);
                return obj;
            } catch {
                /* empty */
            }
        }

        throw new Error('No Protobuf schema found for the given buffer');
    }
}
