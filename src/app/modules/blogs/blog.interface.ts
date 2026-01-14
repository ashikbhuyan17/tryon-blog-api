import { Types } from 'mongoose'

export type BlogStatus = 'draft' | 'published'
export type BlogCategory =
  | 'Featured'
  | 'Announcement'
  | 'Event'
  | 'Reminder'
  | 'News'
  | 'Alert'
  | 'Notification'

export interface IBlog {
  _id?: Types.ObjectId
  title: string
  description: string
  status: BlogStatus
  category?: BlogCategory | null // Blog category/tag (optional)
  author: Types.ObjectId | string // Reference to User
  createdAt?: Date
  updatedAt?: Date
  publishedAt?: Date
  image?: string // Base64 encoded image
}
