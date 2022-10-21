#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { Ec2Stack } from '../lib/ec2-stack';
import { RdsStack } from '../lib/rds-stack';
import { S3Stack } from '../lib/s3-stack';
import { SqsStack } from '../lib/sqs-stack';
import { IamStack } from '../lib/iam-stack';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

const s3Stack = new S3Stack(app, 'S3Stack', {
  env
});

const { bucketName } = s3Stack.outputs;

const sqsStack = new SqsStack(app, 'SqsStack', {
  env
});

const { queueUrl } = sqsStack.outputs;

const vpcStack = new VpcStack(app, 'VpcStack', {
  env
});

const {
  vpc, 
  publicSubnetGroupName,
  privateSubnetGroupName,
  serviceSg,
  databaseSg
} = vpcStack.outputs;

const rdsStack = new RdsStack(app, 'RdsStack', {
  vpc,
  privateSubnetGroupName,
  databaseSg,
  env
});

const iamStack = new IamStack(app, 'IamStack', {
  bucketName,
  queueUrl,
  env
});

const {
  serviceRole
} = iamStack.outputs;

const ec2Stack = new Ec2Stack(app, 'Ec2Stack', {
  vpc, 
  publicSubnetGroupName,
  serviceSg,
  serviceRole,
  bucketName,
  queueUrl,
  env
});

