import * as cdk from 'aws-cdk-lib';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import { AclCidr, AclTraffic, Action, NetworkAcl, Peer, Port, SecurityGroup, SubnetType, TrafficDirection, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class SqsStack extends cdk.Stack {

    public readonly outputs: any;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const sqsId = 'demo-sqs';
        const sqsQueue = new Queue(this, sqsId);

        const { queueUrl, queueName } = sqsQueue;
        this.outputs = {
            queueUrl, 
            queueName
        };
    }
}
