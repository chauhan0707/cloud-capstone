import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { UpdateDiaryRequest } from '../../requests/UpdateDiaryRequest'
import { updateDiary } from '../../businessLogic/diarys'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update-diary')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const diaryId: string = event.pathParameters.diaryId
      const updatedDiary: UpdateDiaryRequest = JSON.parse(event.body)

      const jwtToken: string = getToken(event.headers.Authorization)

      await updateDiary(diaryId, updatedDiary, jwtToken)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: ''
      }
    } catch (e) {
      logger.error('Error', { error: e.message })

      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)
