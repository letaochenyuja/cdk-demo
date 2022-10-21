import * as cdk from 'aws-cdk-lib';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import { AclCidr, AclTraffic, Action, NetworkAcl, Peer, Port, SecurityGroup, SubnetType, TrafficDirection, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Role, ServicePrincipal, Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface IamStackInputs extends StackProps {
    readonly bucketName: string;
    readonly queueUrl: string;
}

export class IamStack extends cdk.Stack {

    public readonly outputs: any;

    constructor(scope: Construct, id: string, props?: IamStackInputs) {
        super(scope, id, props);

        const { bucketName, queueUrl } = props!;

        const serviceRoleId = `demo-service-role`;
        const serviceRole = new Role(this, serviceRoleId, {
            assumedBy: new ServicePrincipal("ec2.amazonaws.com")
        });

        // bucket

        const accessBucketPolicyId = `access-demo-bucket-policy`;
        const accessBucketPolicy = new Policy(this, accessBucketPolicyId, {
            statements: [
                new PolicyStatement({
                    actions: ["s3:PutObject", "s3:GetObject"],
                    resources: [`arn:aws:s3:::${bucketName}/*`],
                    effect: Effect.ALLOW
                })
            ],
            roles: [serviceRole]
        });

        // sqs 

        const accessSqsPolicyId = `access-demo-sqs-policy`;
        const accessSqsPolicy = new Policy(this, accessSqsPolicyId, {
            statements: [
                new PolicyStatement({
                    actions: ["sqs:SendMessage"],
                    resources: [`arn:aws:sqs:*:*:${queueUrl}`]
                })
            ],
            roles: [serviceRole]
        });

        this.outputs = {
            serviceRole
        };

        new CfnOutput(this, 'accessBucketPolicyId', {
            value: accessBucketPolicyId
        });

        new CfnOutput(this, 'accessSqsPolicyId', {
            value: accessSqsPolicyId
        });

        new CfnOutput(this, 'serviceRole', {
            value: serviceRoleId
        });
    }
}
