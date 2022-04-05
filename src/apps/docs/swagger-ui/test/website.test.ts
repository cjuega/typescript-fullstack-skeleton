import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import DocsWebsiteStack from '../lib/website-stack';

describe('docsWebsiteStack', () => {
    it('snapshot testing', () => {
        expect.hasAssertions();

        const app = new App(),
            stack = new DocsWebsiteStack(app, 'MyTestDocsWebsiteStack'),
            template = Template.fromStack(stack);

        expect(template).toMatchSnapshot();
    });
});
