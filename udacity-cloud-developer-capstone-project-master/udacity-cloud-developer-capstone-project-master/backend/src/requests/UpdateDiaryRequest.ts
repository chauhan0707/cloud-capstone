/**
 * Fields in a request to update a single Diary item.
 */
export interface UpdateDiaryRequest {
  name: string
  dueDate: string
  done: boolean
}
