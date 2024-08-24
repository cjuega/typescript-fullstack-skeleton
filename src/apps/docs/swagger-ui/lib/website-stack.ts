import { CfnOutput, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { SPADeploy } from 'cdk-spa-deploy';
import type { Construct } from 'constructs';

export default class WebsiteStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const { websiteBucket, distribution } = new SPADeploy(this, 'Docs', { encryptBucket: true }).createSiteWithCloudfront({
            indexDoc: 'index.html',
            websiteFolder: 'dist'
        });

        websiteBucket.applyRemovalPolicy(RemovalPolicy.DESTROY);

        new CfnOutput(this, 'CloudfrontDistributionId', {
            description: 'CloudfrontDistributionId',
            value: distribution.distributionId,
            exportName: `${id}-CloudfrontDistributionId`
        });

        new CfnOutput(this, 'bucket name', {
            description: 'The name of the S3 bucket holding the website',
            value: websiteBucket.bucketName,
            exportName: `${id}-BucketName`
        });
    }
}
