import * as cdk from 'aws-cdk-lib';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import { AclCidr, AclTraffic, Action, AmazonLinuxGeneration, AmazonLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, ISecurityGroup, NetworkAcl, Peer, Port, SecurityGroup, SubnetType, TrafficDirection, UserData, Vpc } from 'aws-cdk-lib/aws-ec2';
import { IRole, Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface Ec2StackInputs extends StackProps {
    readonly vpc: Vpc;
    readonly publicSubnetGroupName: string;
    readonly serviceSg: ISecurityGroup;
    readonly serviceRole: IRole;
    readonly bucketName: string;
    readonly queueUrl: string;
    readonly queueName: string;
}

export class Ec2Stack extends cdk.Stack {

    public readonly outputs: any;

    constructor(scope: Construct, id: string, props?: Ec2StackInputs) {
        super(scope, id, props);

        const { 
            vpc, 
            publicSubnetGroupName, 
            serviceSg, 
            serviceRole, 
            bucketName, 
            queueUrl, 
            queueName 
        } = props!;

        const fileName = "hello_world.txt";

        const userData = UserData.forLinux();
        userData.addCommands(
            `su - ec2-user`,
            `yum update -y`,
            `yum install -y curl unzip`,
            `cd /home/ec2-user`,
            `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"`,
            `unzip awscliv2.zip`,
            `sudo ./aws/install`,
            `aws configure set region "us-west-1"`,
            `aws configure set output "json"`,
            `touch ${fileName}`,
            `echo "hello world" > ${fileName}`,
            `aws s3 cp ${fileName} s3://${bucketName}/${fileName}`,
            `aws sqs send-message --queue-url ${queueUrl} --message-body "${fileName} UPLOADED"`
        );

        const ec2InstanceId = 'demo-ec2';
        const ec2Instance = new Instance(this, ec2InstanceId, {
            vpc,
            vpcSubnets: {
                subnetGroupName: publicSubnetGroupName
            },
            role: serviceRole,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            machineImage: new AmazonLinuxImage({
                generation: AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
            userData,
            securityGroup: serviceSg,
            keyName: "sandbox_tunnel"
        });

        const { instanceId } = ec2Instance;
        this.outputs = {
            instanceId
        };
    }
}
