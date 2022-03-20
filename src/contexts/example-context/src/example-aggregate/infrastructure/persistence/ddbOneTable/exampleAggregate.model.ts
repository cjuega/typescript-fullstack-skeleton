const model = {
    pk: { type: String, value: '${_type}:${id}' },
    sk: { type: String, value: '${_type}:' },
    id: { type: String, required: true },
    createdAt: { type: String, required: true }
} as const;

export default model;
