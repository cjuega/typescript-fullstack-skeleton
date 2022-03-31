/* eslint-disable import/prefer-default-export */
import { CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Secret, SecretStringValueBeta1 } from 'aws-cdk-lib/aws-secretsmanager';
import {
    PipelineProject, BuildSpec, LinuxBuildImage, BuildEnvironmentVariableType
} from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeStarConnectionsSourceAction, CodeBuildAction, Action } from 'aws-cdk-lib/aws-codepipeline-actions';
import { CfnConnection } from 'aws-cdk-lib/aws-codestarconnections';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class CICDStack extends Stack {
    private readonly services: string[] = this.node.tryGetContext('services').split(',');

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceProvider = this.node.tryGetContext('provider'),
            repository = this.node.tryGetContext('repository'),
            dockerSecret = this.buildDockerhubSecret();

        this.services = this.node.tryGetContext('services').split(',');

        this.buildCICDPipeline(sourceProvider, repository, dockerSecret);
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

    private buildCICDPipeline(sourceProvider: 'Bitbucket' | 'GitHub', repository: string, dockerSecret: Secret) {
        const [sourceAction, sourceOutput] = this.buildSourceAction(sourceProvider, repository),
            [testAction, testOutput] = this.buildTestAction(sourceOutput, dockerSecret),
            [deployAction] = this.buildDeployAction(testOutput);

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
                    stageName: 'TestBuild',
                    actions: [testAction]
                },
                {
                    stageName: 'BuildDeploy',
                    actions: [deployAction]
                }
            ]
        });
    }

    private buildSourceAction(sourceProvider: 'Bitbucket' | 'GitHub', repository: string): [Action, Artifact] {
        const connection = new CfnConnection(this, 'ConnectionToRepository', {
                connectionName: `${sourceProvider}`,
                providerType: sourceProvider
            }),
            [owner, repositoryAndBranch] = repository.split('/'),
            [repo, branch] = repositoryAndBranch.split('#'),
            output = new Artifact(),
            action = new CodeStarConnectionsSourceAction({
                actionName: 'SourceAction',
                owner,
                repo,
                branch,
                output,
                connectionArn: connection.ref
            });

        return [action, output];
    }

    private buildTestAction(sourceOutput: Artifact, dockerSecret: Secret): [Action, Artifact] {
        const project = new PipelineProject(this, 'TestBuild', {
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0,
                    privileged: true
                },
                environmentVariables: {
                    SECRET_ID: {
                        type: BuildEnvironmentVariableType.PLAINTEXT,
                        value: dockerSecret.secretArn
                    }
                }
            }),
            output = new Artifact(),
            action = new CodeBuildAction({
                actionName: 'Test-Build',
                project,
                input: sourceOutput,
                outputs: [output]
            });

        dockerSecret.grantRead(project);

        this.buildBasicPermissionsForServerlessFramework().forEach((statement) => {
            project.addToRolePolicy(statement);
        });

        this.buildServicesDependentPermissions().forEach((statement) => {
            project.addToRolePolicy(statement);
        });

        return [action, output];
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
                actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:DescribeLogStreams', 'logs:FilterLogEvents'],
                resources: this.services.map((s) => `arn:aws:logs:${region}:${region}:log-group:/aws/lambda/${s}*:log-stream:*`)
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
                actions: ['apigateway:GET', 'apigateway:PATCH', 'apigateway:POST', 'apigateway:PUT', 'apigateway:DELETE'],
                resources: [`arn:aws:apigateway:${region}::/restapis`, `arn:aws:apigateway:${region}::/restapis/*`]
            })
        );

        statements.push(
            new PolicyStatement({
                actions: ['events:*'],
                resources: this.services.map((s) => `arn:aws:events:${region}:${account}:event-bus/${s}*`)
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

    private buildDeployAction(testOutput: Artifact): [Action, Artifact] {
        const project = new PipelineProject(this, 'BuildDeploy', {
                buildSpec: BuildSpec.fromObject({
                    version: '0.2',
                    phases: {
                        install: {
                            'runtime-versions': {
                                nodejs: '14.x'
                            }
                        },
                        build: {
                            commands: ['bash scripts/deploy-artifacts.sh']
                        }
                    }
                }),
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0
                }
            }),
            output = new Artifact(),
            action = new CodeBuildAction({
                actionName: 'Build-Deploy',
                project,
                input: testOutput,
                outputs: [output]
            });

        this.buildBasicPermissionsForServerlessFramework().forEach((statement) => {
            project.addToRolePolicy(statement);
        });

        this.buildServicesDependentPermissions().forEach((statement) => {
            project.addToRolePolicy(statement);
        });

        return [action, output];
    }
}
