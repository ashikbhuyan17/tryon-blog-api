import { Types } from 'mongoose'

export type BlogStatus = 'draft' | 'published'

export interface IBlog {
  _id?: Types.ObjectId
  title: string
  description: string
  status: BlogStatus
  author: Types.ObjectId | string // Reference to User
  createdAt?: Date
  updatedAt?: Date
  publishedAt?: Date
  image?: string // Base64 encoded image
}
