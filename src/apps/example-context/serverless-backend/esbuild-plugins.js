/* eslint-disable @typescript-eslint/no-var-requires */
const { copy } = require('esbuild-plugin-copy');

module.exports = (serverless) => {
    const env = serverless.service.provider.stage;

    return [
        copy({
            assets: {
                from: ['./src/config/default.json', `./src/config/${env}.json`],
                to: ['.']
            }
        })
    ];
};
