import * as cdk from 'aws-cdk-lib';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import { AclCidr, AclTraffic, Action, NetworkAcl, Peer, Port, SecurityGroup, SubnetType, TrafficDirection, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class S3Stack extends cdk.Stack {

    public readonly outputs: any;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const bucketId = 'demo-bucket';
        const bucket = new Bucket(this, bucketId);

        const { bucketName } = bucket;
        this.outputs = {
            bucketName
        };

        new CfnOutput(this, 'bucketName', {
            value: bucketName
        });
    }
}
