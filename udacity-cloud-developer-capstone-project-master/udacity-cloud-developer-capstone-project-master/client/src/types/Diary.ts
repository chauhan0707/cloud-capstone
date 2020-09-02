export interface Diary {
  diaryId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
  validUrl?: boolean
}
