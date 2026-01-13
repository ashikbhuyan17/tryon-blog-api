import express from 'express'
const router = express.Router()
import userRoute from '../modules/users/user.route'
import blogRoute from '../modules/blogs/blog.route'

const appRoutes = [
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/blog',
    route: blogRoute,
  },
]

appRoutes.forEach(route => router.use(route.path, route.route))

export default router
