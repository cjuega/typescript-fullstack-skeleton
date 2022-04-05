import {
    Stack, StackProps, RemovalPolicy, CfnOutput
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SPADeploy } from 'cdk-spa-deploy';

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
            value: distribution.distributionId
        });

        new CfnOutput(this, 'bucket name', {
            description: 'The name of the S3 bucket holding the website',
            value: websiteBucket.bucketName
        });
    }
}
