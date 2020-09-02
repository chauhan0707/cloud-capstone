export interface DiaryItem {
  userId: string
  diaryId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
