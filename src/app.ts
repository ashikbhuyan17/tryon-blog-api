import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import routers from './app/routes'
import { globarError } from './middleware/globalError'
import status from 'http-status'
const app: Application = express()

// Middleware
app.use(cors())

// Set body size limit to 1MB for base64 images
// Default limit is 100kb, which is too small for base64 encoded images
// 1MB limit prevents excessively large images
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Swagger API Documentation
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Blog API Documentation',
  customfavIcon: '/favicon.ico',
}

app.use('/api-docs', swaggerUi.serve as unknown as express.RequestHandler[])
app.get(
  '/api-docs',
  swaggerUi.setup(
    swaggerSpec,
    swaggerUiOptions,
  ) as unknown as express.RequestHandler,
)

// API Documentation JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Data API
app.use('/api/v1', routers)

// Testing API
app.get('/', (req: Request, res: Response) => {
  res.send('+++ App Running Successfully +++')
  // Uncought Error
  // console.log(x)

  // Test Error
  // throw new Error('General Error')

  // Test API Error
  // throw new ApiError(403, 'API Error')

  // Promiss rejection
  // Promise.reject(new Error(`Unhandle Promiss Rejection`))
})

// Global error handle
app.use(globarError)

// Unknown API Handle
app.use((req: Request, res: Response) => {
  res.status(status.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessage: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  })
})

export default app
