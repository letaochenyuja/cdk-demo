import * as cdk from 'aws-cdk-lib';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import { Ec2Action } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { AclCidr, AclTraffic, Action, InstanceClass, InstanceSize, InstanceType, ISecurityGroup, NetworkAcl, Peer, Port, SecurityGroup, SubnetType, TrafficDirection, Vpc } from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance, DatabaseInstanceEngine, MariaDbEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export interface RdsStackInputs extends StackProps {
    readonly vpc: Vpc;
    readonly privateSubnetGroupName: string;
    readonly databaseSg: ISecurityGroup;
}

export class RdsStack extends cdk.Stack {

    public readonly outputs: any;

    constructor(scope: Construct, id: string, props?: RdsStackInputs) {
        super(scope, id, props);

        const { vpc, privateSubnetGroupName, databaseSg } = props!;

        const databaseId = 'demo-db';
        const database = new DatabaseInstance(this, databaseId, {
            vpc,
            engine: DatabaseInstanceEngine.mariaDb({ version: MariaDbEngineVersion.VER_10_6_8 }),
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            vpcSubnets: {
                subnetGroupName: privateSubnetGroupName
            },
            securityGroups: [databaseSg]
        });

        const { instanceIdentifier } = database;
        this.outputs = {
            instanceIdentifier 
        };

        new CfnOutput(this, 'instanceIdentifier', {
            value: instanceIdentifier
        });
    }
}
