import { apiEndpoint, subDirectory, devapiEndpoint } from '../config'
import { Diary } from '../types/Diary'
import { CreateDiaryRequest } from '../types/CreateDiaryRequest'
import Axios from 'axios'
import { UpdateDiaryRequest } from '../types/UpdateDiaryRequest'

console.log('is offline:', process.env.REACT_APP_IS_OFFLINE)

let Endpoint: string
let JWTtoken: string

if (
  process.env.REACT_APP_IS_OFFLINE == 'false' ||
  process.env.REACT_APP_IS_OFFLINE == undefined
) {
  Endpoint = apiEndpoint
} else {
  console.log('offline')
  Endpoint = devapiEndpoint
}
console.log(Endpoint)

export async function getDiaries(idToken: string): Promise<Diary[]> {
  console.log('Fetching diarys')
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  console.log('My token id:', JWTtoken)
  console.log('get link: ', `${Endpoint}/${subDirectory}`)
  const response = await Axios.get(`${Endpoint}/${subDirectory}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JWTtoken}`
    }
  })
  console.log('Diaries:', response.data)
  console.log('token', JWTtoken)
  return response.data.items
}

export async function createDiary(
  idToken: string,
  newDiary: CreateDiaryRequest
): Promise<Diary> {
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  const response = await Axios.post(
    `${Endpoint}/${subDirectory}`,
    JSON.stringify(newDiary),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
  console.log(response.data)

  return response.data.newItem
}

export async function patchDiary(
  idToken: string,
  diaryId: string,
  updatedDiary: UpdateDiaryRequest
): Promise<void> {
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  await Axios.patch(
    `${Endpoint}/${subDirectory}/${diaryId}`,
    JSON.stringify(updatedDiary),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
}

export async function deleteDiary(
  idToken: string,
  diaryId: string
): Promise<void> {
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  console.log('Deletion endpoint', `${Endpoint}/${subDirectory}/${diaryId}`)
  await Axios.delete(`${Endpoint}/${subDirectory}/${diaryId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JWTtoken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  diaryId: string
): Promise<string> {
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  const response = await Axios.post(
    `${Endpoint}/${subDirectory}/${diaryId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
  console.log(response.data)

  return response.data.uploadUrl
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file)
}

export const checkAttachmentURL = async (
  attachmentUrl: string
): Promise<boolean> => {
  await Axios.get(attachmentUrl)

  return true
}
