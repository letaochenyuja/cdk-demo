import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { AclCidr, AclTraffic, Action, NetworkAcl, Peer, Port, SecurityGroup, SubnetType, TrafficDirection, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

function allowHttp(
  networkAcl: NetworkAcl,
  direction: TrafficDirection,
  cidr: AclCidr
) {
  networkAcl.addEntry("AllowHTTP" + direction.toString(), {
    cidr,
    ruleNumber: 100,
    traffic: AclTraffic.tcpPort(80),
    direction,
    ruleAction: Action.ALLOW,
  });
}

function allowHttps(
  networkAcl: NetworkAcl,
  direction: TrafficDirection,
  cidr: AclCidr
) {
  networkAcl.addEntry("AllowHTTPS" + direction.toString(), {
    cidr,
    ruleNumber: 110,
    traffic: AclTraffic.tcpPort(443),
    direction,
    ruleAction: Action.ALLOW,
  });
}

function allowApplicationPorts(
  networkAcl: NetworkAcl,
  direction: TrafficDirection,
  cidr: AclCidr
) {
  networkAcl.addEntry("AllowApplicationPortsTcp" + direction.toString(), {
    cidr,
    ruleNumber: 130,
    traffic: AclTraffic.tcpPortRange(1024, 65535),
    direction,
    ruleAction: Action.ALLOW,
  });

  networkAcl.addEntry("AllowApplicationPortsUdp" + direction.toString(), {
    cidr,
    ruleNumber: 140,
    traffic: AclTraffic.udpPortRange(1024, 65535),
    direction,
    ruleAction: Action.ALLOW,
  });
}

function allowSsh(
  networkAcl: NetworkAcl,
  direction: TrafficDirection,
  cidr: AclCidr
) {
  networkAcl.addEntry("AllowSSH" + direction.toString(), {
    cidr,
    ruleNumber: 150, 
    traffic: AclTraffic.tcpPort(22),
    direction,
    ruleAction: Action.ALLOW
  });
}

export class VpcStack extends cdk.Stack {

  public readonly outputs: any;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // vpc + subnets

    const publicSubnetGroupName = "publicSubnet";
    const privateSubnetGroupName = "privateSubnet";
    const vpc = new Vpc(this, "test-vpc", {
      cidr: undefined,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: publicSubnetGroupName,
          subnetType: SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: privateSubnetGroupName,
          subnetType: SubnetType.PRIVATE_ISOLATED
        },
      ]
    });

    // nacls

    const publicNacl = new NetworkAcl(this, "publicNacl", {
      vpc,
      subnetSelection: {
        subnetGroupName: publicSubnetGroupName
      }
    });

    allowSsh(publicNacl, TrafficDirection.INGRESS, AclCidr.anyIpv4());
    allowHttp(publicNacl, TrafficDirection.INGRESS, AclCidr.anyIpv4());
    allowHttp(publicNacl, TrafficDirection.EGRESS, AclCidr.anyIpv4());
    allowHttps(publicNacl, TrafficDirection.INGRESS, AclCidr.anyIpv4());
    allowHttps(publicNacl, TrafficDirection.EGRESS, AclCidr.anyIpv4());
    allowApplicationPorts(publicNacl, TrafficDirection.INGRESS, AclCidr.anyIpv4());
    allowApplicationPorts(publicNacl, TrafficDirection.EGRESS, AclCidr.anyIpv4());

    const privateNacl = new NetworkAcl(this, "privateNacl", {
      vpc, 
      subnetSelection: {
        subnetGroupName: privateSubnetGroupName
      }
    });

    allowApplicationPorts(privateNacl, TrafficDirection.INGRESS, AclCidr.anyIpv4());
    allowApplicationPorts(privateNacl, TrafficDirection.EGRESS, AclCidr.anyIpv4());

    // sgs

    const serviceSg = new SecurityGroup(this, "serviceSg", {
      vpc,
      allowAllOutbound: true
    });

    serviceSg.connections.allowFromAnyIpv4(Port.tcp(80));
    serviceSg.connections.allowFromAnyIpv4(Port.tcp(443));
    serviceSg.connections.allowFrom(Peer.ipv4("142.112.79.184/32"), Port.tcp(22));

    const databaseSg = new SecurityGroup(this, "databaseSg", {
      vpc, 
      allowAllOutbound: true
    });

    databaseSg.connections.allowFrom(serviceSg, Port.tcp(3306));

    // outputs

    this.outputs = {
      vpc,
      publicSubnetGroupName,
      privateSubnetGroupName,
      serviceSg,
      databaseSg
    };
  }
}
