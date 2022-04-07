import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import CICDStack from '../lib/cicd-stack';

describe('cicdStack', () => {
    // eslint-disable-next-line jest/prefer-expect-assertions,jest/expect-expect
    it('should contain a DockerhubPassword parameter with noEcho flag enabled', () => {
        const app = new App({
                context: {
                    provider: 'GitHub',
                    repository: 'cjuega/typescript-fullstack-skeleton#master',
                    services: 'swagger-ui-docs,example-context'
                }
            }),
            stack = new CICDStack(app, 'MyTestCICDStack'),
            template = Template.fromStack(stack);

        template.hasParameter('DockerhubPassword', {
            NoEcho: true
        });
    });

    // eslint-disable-next-line jest/prefer-expect-assertions,jest/expect-expect
    it("should store dockerhub user and pass within SecretsManager and they aren't readable in the template", () => {
        const app = new App({
                context: {
                    provider: 'GitHub',
                    repository: 'cjuega/typescript-fullstack-skeleton#master',
                    services: 'swagger-ui-docs,example-context'
                }
            }),
            stack = new CICDStack(app, 'MyTestCICDStack'),
            template = Template.fromStack(stack);

        template.hasResourceProperties('AWS::SecretsManager::Secret', {
            SecretString: {
                'Fn::Join': ['', ['{"username":"', { Ref: 'DockerhubUsername' }, '","password":"', { Ref: 'DockerhubPassword' }, '"}']]
            }
        });
    });

    // eslint-disable-next-line jest/prefer-expect-assertions,jest/expect-expect
    it('should codepipeline is created', () => {
        const app = new App({
                context: {
                    provider: 'GitHub',
                    repository: 'cjuega/typescript-fullstack-skeleton#master',
                    services: 'swagger-ui-docs,example-context'
                }
            }),
            stack = new CICDStack(app, 'MyTestCICDStack'),
            template = Template.fromStack(stack);

        template.hasResourceProperties('AWS::CodePipeline::Pipeline', {});
    });

    it('snapshot testing', () => {
        expect.hasAssertions();

        const app = new App({
                context: {
                    provider: 'GitHub',
                    repository: 'cjuega/typescript-fullstack-skeleton#master',
                    services: 'swagger-ui-docs,example-context'
                }
            }),
            stack = new CICDStack(app, 'MyTestCICDStack'),
            template = Template.fromStack(stack);

        expect(template).toMatchSnapshot();
    });
});
