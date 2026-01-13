import { User } from './user.model'

export const findLastUserId = async () => {
  const lastUser = await User.findOne({}, { id: true, _id: false })
    .sort({
      createdAt: -1,
    })
    .lean()

  return lastUser?.id
}

export const generateUserId = async () => {
  const currentId = (await findLastUserId()) || String(0).padStart(5, '0')
  const incrementId = String(parseInt(currentId) + 1).padStart(5, '0')
  return incrementId
}
