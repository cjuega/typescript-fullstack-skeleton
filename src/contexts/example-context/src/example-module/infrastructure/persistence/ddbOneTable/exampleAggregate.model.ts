const model = {
    pk: { type: String, value: 'ExampleAggregate:${id}' },
    sk: { type: String, value: 'ExampleAggregate:' },
    id: { type: String, required: true },
    createdAt: { type: String, required: true }
} as const;

export default model;
