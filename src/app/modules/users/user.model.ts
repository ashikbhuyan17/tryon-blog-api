import { Schema, model, Model } from 'mongoose'
import bcrypt from 'bcrypt'
import { IUser, IUserExistResult } from './user.interface'

// Define static methods interface
interface UserModel extends Model<IUser> {
  isUserExist(phone: string): Promise<IUserExistResult | null>
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string,
  ): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^\d{11}$/.test(v)
        },
        message: 'Phone must be exactly 11 digits',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: 0, // Don't return password by default in queries
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['admin', 'user'],
      default: 'user',
    },
    userType: {
      type: String,
      required: [true, 'UserType is required'],
      enum: ['reserveit'],
      default: 'reserveit',
    },
  },
  {
    timestamps: true,
  },
) as Schema<IUser, UserModel>

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) {
    return next()
  }

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Static method to check if user exists
// Returns both _id (Mongoose default) and id (custom)
userSchema.statics.isUserExist = async function (
  phone: string,
): Promise<IUserExistResult | null> {
  const user = await this.findOne(
    { phone },
    { _id: 1, id: 1, phone: 1, password: 1, role: 1, userType: 1, name: 1 },
  ).lean()

  if (!user) {
    return null
  }

  // Convert ObjectId to string for _id
  return {
    ...user,
    _id: user._id?.toString(),
  } as IUserExistResult
}

// Static method to check if password matches
userSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword)
}

export const User = model<IUser, UserModel>('User', userSchema)
