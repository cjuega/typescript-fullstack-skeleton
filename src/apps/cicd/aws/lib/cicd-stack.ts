import {
    CfnParameter, Fn, RemovalPolicy, Stack, StackProps
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Secret, SecretStringValueBeta1 } from 'aws-cdk-lib/aws-secretsmanager';
import {
    PipelineProject, LinuxBuildImage, BuildEnvironmentVariableType, Cache
} from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeStarConnectionsSourceAction, CodeBuildAction, Action } from 'aws-cdk-lib/aws-codepipeline-actions';
import { CfnConnection } from 'aws-cdk-lib/aws-codestarconnections';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export default class CICDStack extends Stack {
    private readonly sourceProvider: 'Bitbucket' | 'GitHub';

    private readonly repository: string;

    private readonly services: string[];

    private readonly bucketCache: Bucket;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.sourceProvider = this.node.tryGetContext('provider');
        this.repository = this.node.tryGetContext('repository');
        this.services = this.node.tryGetContext('services').split(',');

        this.bucketCache = new Bucket(this, 'CacheBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

        this.buildCICDPipeline(this.buildDockerhubSecret());
    }

    private buildDockerhubSecret(): Secret {
        const dockerhubUser = new CfnParameter(this, 'DockerhubUsername', {
                type: 'String',
                description: 'Username to be used to log in dockerhub to pull docker images.'
            }),
            dockerhubPass = new CfnParameter(this, 'DockerhubPassword', {
                type: 'String',
                description: 'Password to be used to log in dockerhub to pull docker images.',
                noEcho: true
            }),
            secretStr = JSON.stringify({ username: dockerhubUser.valueAsString, password: dockerhubPass.valueAsString });

        return new Secret(this, 'DockerHubSecret', {
            secretStringBeta1: SecretStringValueBeta1.fromToken(secretStr)
        });
    }

    private buildCICDPipeline(dockerSecret: Secret) {
        const [sourceAction, sourceOutput] = this.buildSourceAction(),
            testAction = this.buildTestAction(sourceOutput, dockerSecret);

        // eslint-disable-next-line no-new
        new Pipeline(this, 'Pipeline', {
            crossAccountKeys: false,
            restartExecutionOnUpdate: true,
            stages: [
                {
                    stageName: 'Source',
                    actions: [sourceAction]
                },
                {
                    stageName: 'TestAndBuild',
                    actions: [testAction]
                }
            ]
        });
    }

    private buildSourceAction(): [Action, Artifact] {
        const connection = new CfnConnection(this, 'ConnectionToRepository', {
                connectionName: `${this.sourceProvider}`,
                providerType: this.sourceProvider
            }),
            [owner, repositoryAndBranch] = this.repository.split('/'),
            [repo, branch] = repositoryAndBranch.split('#'),
            output = new Artifact(),
            action = new CodeStarConnectionsSourceAction({
                actionName: 'Source',
                owner,
                repo,
                branch,
                output,
                connectionArn: connection.ref,
                codeBuildCloneOutput: true
            });

        return [action, output];
    }

    private buildTestAction(sourceOutput: Artifact, dockerSecret: Secret): Action {
        const project = new PipelineProject(this, 'TestAndBuild', {
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0,
                    privileged: true
                },
                environmentVariables: {
                    SECRET_ID: {
                        type: BuildEnvironmentVariableType.PLAINTEXT,
                        value: dockerSecret.secretArn
                    }
                },
                logging: {
                    cloudWatch: {
                        logGroup: new LogGroup(this, 'TestAndBuildLogGroup', {
                            retention: RetentionDays.ONE_WEEK,
                            removalPolicy: RemovalPolicy.DESTROY
                        })
                    }
                },
                cache: Cache.bucket(this.bucketCache)
            }),
            action = new CodeBuildAction({
                actionName: 'TestAndBuild',
                project,
                input: sourceOutput
            });

        dockerSecret.grantRead(project);

        this.buildBasicPermissionsForCDK().forEach((statement) => {
            project.addToRolePolicy(statement);
        });

        this.buildBasicPermissionsForServerlessFramework().forEach((statement) => {
            project.addToRolePolicy(statement);
        });

        this.buildServicesDependentPermissions().forEach((statement) => {
            project.addToRolePolicy(statement);
        });

        return action;
    }

    private buildBasicPermissionsForCDK(): PolicyStatement[] {
        const { account } = Stack.of(this),
            statements = [];

        statements.push(
            new PolicyStatement({
                actions: ['sts:AssumeRole'],
                resources: [`arn:aws:iam::${account}:role/cdk-*`]
            })
        );

        return statements;
    }

    private buildBasicPermissionsForServerlessFramework(): PolicyStatement[] {
        const { region, account } = Stack.of(this),
            statements = [];

        statements.push(
            new PolicyStatement({
                actions: ['apigateway:GET', 'apigateway:PATCH', 'apigateway:POST', 'apigateway:PUT'],
                resources: [`arn:aws:apigateway:${region}::/apis`, `arn:aws:apigateway:${region}::/apis/*`]
            })
        );

        statements.push(
            new PolicyStatement({
                actions: [
                    'cloudformation:CancelUpdateStack',
                    'cloudformation:ContinueUpdateRollback',
                    'cloudformation:CreateChangeSet',
                    'cloudformation:CreateStack',
                    'cloudformation:CreateUploadBucket',
                    'cloudformation:DeleteChangeSet',
                    'cloudformation:DeleteStack',
                    'cloudformation:Describe*',
                    'cloudformation:EstimateTemplateCost',
                    'cloudformation:ExecuteChangeSet',
                    'cloudformation:Get*',
                    'cloudformation:List*',
                    'cloudformation:UpdateStack',
                    'cloudformation:UpdateTerminationProtection'
                ],
                resources: this.services.map((s) => `arn:aws:cloudformation:${region}:${account}:stack/${s}*/*`)
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['cloudformation:ValidateTemplate', 'ec2:Describe*'],
                resources: ['*']
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['events:Put*', 'events:Describe*', 'events:List*'],
                resources: this.services.map((s) => `arn:aws:events:${region}:${account}:rule/${s}*`)
            })
        );

        statements.push(
            new PolicyStatement({
                actions: [
                    'iam:AttachRolePolicy',
                    'iam:CreateRole',
                    'iam:DeleteRole',
                    'iam:DeleteRolePolicy',
                    'iam:DetachRolePolicy',
                    'iam:GetRole',
                    'iam:PassRole',
                    'iam:PutRolePolicy'
                ],
                resources: this.services.map((s) => `arn:aws:iam::*:role/${s}-*`)
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['lambda:*'],
                resources: this.services.map((s) => `arn:aws:lambda:*:*:function:${s}*`)
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['logs:DescribeLogGroups'],
                resources: [`arn:aws:logs:${region}:${account}:log-group::log-stream:*`]
            })
        );

        statements.push(
            new PolicyStatement({
                actions: [
                    'logs:CreateLogGroup',
                    'logs:DeleteLogGroup',
                    'logs:CreateLogStream',
                    'logs:DeleteLogStream',
                    'logs:DescribeLogStreams',
                    'logs:FilterLogEvents',
                    'logs:PutRetentionPolicy',
                    'logs:DeleteRetentionPolicy'
                ],
                resources: this.services.map((s) => `arn:aws:logs:${region}:${account}:log-group:/aws/lambda/${s}*:log-stream:*`)
            })
        );

        statements.push(
            new PolicyStatement({
                actions: [
                    's3:CreateBucket',
                    's3:DeleteBucket',
                    's3:DeleteBucketPolicy',
                    's3:DeleteObject',
                    's3:DeleteObjectVersion',
                    's3:Get*',
                    's3:List*',
                    's3:PutBucketNotification',
                    's3:PutBucketPolicy',
                    's3:PutBucketTagging',
                    's3:PutBucketWebsite',
                    's3:PutEncryptionConfiguration',
                    's3:PutObject'
                ],
                resources: this.services.map((s) => `arn:aws:s3:::${s}*`)
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['s3:*'],
                resources: this.services.map((s) => `arn:aws:s3:::${s}*/*`)
            })
        );

        return statements;
    }

    private buildServicesDependentPermissions(): PolicyStatement[] {
        const { region, account } = Stack.of(this),
            statements = [];

        statements.push(
            new PolicyStatement({
                actions: ['ssm:DescribeParameters'],
                resources: [`arn:aws:ssm:${region}:${account}:*`]
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['ssm:GetParameter'],
                resources: this.services.map((s) => `arn:aws:ssm:${region}:${account}:parameter/${s}*`)
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['kms:Decrypt'],
                resources: [`arn:aws:kms:${region}:${account}:key/*`]
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['apigateway:GET', 'apigateway:PATCH', 'apigateway:POST', 'apigateway:PUT', 'apigateway:DELETE'],
                resources: [`arn:aws:apigateway:${region}::/restapis`, `arn:aws:apigateway:${region}::/restapis/*`]
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['events:*'],
                resources: this.services
                    .map((s) => [
                        `arn:aws:events:${region}:${account}:event-bus/${s}*`,
                        `arn:aws:events:${region}:${account}:rules/${s}*`,
                        `arn:aws:events:${region}:${account}:rule/${s}*`
                    ])
                    .flat()
            })
        );

        // FIXME: get rid of hardcoded behavior
        if (this.services.includes('swagger-ui-docs')) {
            statements.push(
                new PolicyStatement({
                    actions: ['cloudformation:Describe*'],
                    resources: [`arn:aws:cloudformation:${region}:${account}:stack/DocsWebsiteStack*/*`]
                })
            );

            statements.push(
                new PolicyStatement({
                    actions: ['s3:List*'],
                    resources: [`arn:aws:s3:::${Fn.importValue('DocsWebsiteStack-BucketName')}*`]
                })
            );

            statements.push(
                new PolicyStatement({
                    actions: ['s3:*'],
                    resources: [`arn:aws:s3:::${Fn.importValue('DocsWebsiteStack-BucketName')}*/*`]
                })
            );

            statements.push(
                new PolicyStatement({
                    actions: ['cloudfront:CreateInvalidation'],
                    resources: [
                        `arn:aws:cloudfront::${account}:distribution/${Fn.importValue('DocsWebsiteStack-CloudfrontDistributionId')}`
                    ]
                })
            );
        }

        statements.push(
            new PolicyStatement({
                actions: ['dynamodb:ListTables'],
                resources: [`arn:aws:dynamodb:${region}:${account}:table/*`]
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['dynamodb:*'],
                resources: this.services.map((s) => `arn:aws:dynamodb:${region}:${account}:table/${s}*`)
            })
        );

        return statements;
    }
}
