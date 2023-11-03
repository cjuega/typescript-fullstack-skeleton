import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import CICDStack from '../lib/cicd-stack';

describe('cicdStack', () => {
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

    it('should create an SNS notification topic', () => {
        const app = new App({
                context: {
                    provider: 'GitHub',
                    repository: 'cjuega/typescript-fullstack-skeleton#master',
                    services: 'swagger-ui-docs,example-context'
                }
            }),
            stack = new CICDStack(app, 'MyTestCICDStack'),
            template = Template.fromStack(stack);

        template.hasResourceProperties('AWS::SNS::Topic', {});
        template.hasResourceProperties('AWS::CodeStarNotifications::NotificationRule', {
            DetailType: 'FULL',
            EventTypeIds: [
                'codepipeline-pipeline-pipeline-execution-started',
                'codepipeline-pipeline-pipeline-execution-failed',
                'codepipeline-pipeline-pipeline-execution-succeeded'
            ],
            Targets: [
                {
                    TargetType: 'SNS'
                }
            ]
        });
    });

    it('should create an integration with Slack when slack context is given', () => {
        const app = new App({
                context: {
                    provider: 'GitHub',
                    repository: 'cjuega/typescript-fullstack-skeleton#master',
                    services: 'swagger-ui-docs,example-context',
                    slackWorkspaceId: 'WORKSPACEID',
                    slackChannelId: 'CHANNELID',
                    slackChannelName: 'CI/CD notifications'
                }
            }),
            stack = new CICDStack(app, 'MyTestCICDStack'),
            template = Template.fromStack(stack);

        template.hasResourceProperties('AWS::Chatbot::SlackChannelConfiguration', {
            ConfigurationName: 'CI/CD notifications',
            SlackWorkspaceId: 'WORKSPACEID',
            SlackChannelId: 'CHANNELID'
        });
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
