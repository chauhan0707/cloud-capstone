import * as uuid from 'uuid'

import { DiaryItem } from '../models/DiaryItem'
import { DiaryAccess } from '../dataLayer/diaryAccess'
import { CreateDiaryRequest } from '../requests/CreateDiaryRequest'
import { UpdateDiaryRequest } from '../requests/UpdateDiaryRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const logger = createLogger('diarys')

const diaryAccess = new DiaryAccess()

export const getAllDiarys = async (jwtToken: string): Promise<DiaryItem[]> => {
  const userId = parseUserId(jwtToken)

  return await diaryAccess.getAllDiarys(userId)
}

export const createDiary = async (
  createDiaryRequest: CreateDiaryRequest,
  jwtToken: string
): Promise<DiaryItem> => {
  logger.info('In createDiary() function')

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await diaryAccess.createDiary({
    diaryId: itemId,
    userId,
    name: createDiaryRequest.name,
    dueDate: createDiaryRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}

export const updateDiary = async (
  diaryId: string,
  updateDiaryRequest: UpdateDiaryRequest,
  jwtToken: string
): Promise<DiaryItem> => {
  logger.info('In updateDiary() function')

  const userId = parseUserId(jwtToken)
  logger.info('User Id: ' + userId)

  return await diaryAccess.updateDiary({
    diaryId,
    userId,
    name: updateDiaryRequest.name,
    dueDate: updateDiaryRequest.dueDate,
    done: updateDiaryRequest.done,
    createdAt: new Date().toISOString()
  })
}

export const deleteDiary = async (
  diaryId: string,
  jwtToken: string
): Promise<string> => {
  logger.info('In deleteDiary() function')

  const userId = parseUserId(jwtToken)
  logger.info('User Id: ' + userId)

  return await diaryAccess.deleteDiary(diaryId, userId)
}

export const generateUploadUrl = async (diaryId: string): Promise<string> => {
  logger.info('In generateUploadUrl() function')

  return await diaryAccess.generateUploadUrl(diaryId)
}
