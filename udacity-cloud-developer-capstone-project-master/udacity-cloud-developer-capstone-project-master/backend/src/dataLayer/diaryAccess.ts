import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { DiaryItem } from '../models/DiaryItem'

let XAWS
if (process.env.AWS_XRAY_CONTEXT_MISSING) {
  console.log('Serverless Offline detected; skipping AWS X-Ray setup')
  XAWS = AWS
} else {
  XAWS = AWSXRay.captureAWS(AWS)
}
const logger = createLogger('diary-access')

export class DiaryAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = createS3Client(),
    private readonly diarysTable = process.env.DIARY_TABLE,
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.DIARY_TABLE_IDX
  ) {
    //
  }

  async getAllDiarys(userId: string): Promise<DiaryItem[]> {
    logger.info('Getting all diary items')

    const result = await this.docClient
      .query({
        TableName: this.diarysTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items

    return items as DiaryItem[]
  }

  async createDiary(diary: DiaryItem): Promise<DiaryItem> {
    logger.info(`Creating a diary with ID ${diary.diaryId}`)

    const newItem = {
      ...diary,
      attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${diary.diaryId}`
    }

    await this.docClient
      .put({
        TableName: this.diarysTable,
        Item: newItem
      })
      .promise()

    return diary
  }

  async updateDiary(diary: DiaryItem): Promise<DiaryItem> {
    logger.info(`Updating a diary with ID ${diary.diaryId}`)

    const updateExpression = 'set #n = :name, dueDate = :dueDate, done = :done'

    await this.docClient
      .update({
        TableName: this.diarysTable,
        Key: {
          userId: diary.userId,
          diaryId: diary.diaryId
        },
        UpdateExpression: updateExpression,
        ConditionExpression: 'diaryId = :diaryId',
        ExpressionAttributeValues: {
          ':name': diary.name,
          ':dueDate': diary.dueDate,
          ':done': diary.done,
          ':diaryId': diary.diaryId
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return diary
  }

  async deleteDiary(diaryId: string, userId: string): Promise<string> {
    logger.info(`Deleting a diary with ID ${diaryId}`)

    await this.docClient
      .delete({
        TableName: this.diarysTable,
        Key: {
          userId,
          diaryId
        },
        ConditionExpression: 'diaryId = :diaryId',
        ExpressionAttributeValues: {
          ':diaryId': diaryId
        }
      })
      .promise()

    return userId
  }

  async generateUploadUrl(diaryId: string): Promise<string> {
    logger.info('Generating upload Url')

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: diaryId,
      Expires: this.urlExpiration
    })
  }
}

const createDynamoDBClient = () => {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')

    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } else {
    return new XAWS.DynamoDB.DocumentClient()
  }
}

const createS3Client = () => {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local S3 instance')

    return new AWS.S3({
      s3ForcePathStyle: true,
      // endpoint: new AWS.Endpoint('http://localhost:8200'),
      endpoint: 'http://localhost:8200',
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER'
    })
  } else {
    return new XAWS.S3({ signatureVersion: 'v4' })
  }
}
