import { Model, Types } from 'mongoose'

export type IUser = {
  _id?: Types.ObjectId // Mongoose default _id
  id?: string // Custom id field
  name: string
  phone: string
  password: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
}

// Type for user existence check result
export type IUserExistResult = Pick<
  IUser,
  'id' | 'phone' | 'password' | 'role' | 'name'
> & {
  _id?: string
}

export interface UserModel extends Model<IUser> {
  isUserExist(phone: string): Promise<IUserExistResult | null>
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string,
  ): Promise<boolean>
}
