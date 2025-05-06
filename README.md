# HMPS API Server

A production-ready API server for HMPS School Management System.

## Deployment to Vercel

This repository is configured for easy deployment to Vercel. Follow these steps to deploy:

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/docs/cli) installed (`npm i -g vercel`)
3. MongoDB Atlas database or another MongoDB cloud provider

### Environment Variables

Before deploying, make sure to set up these environment variables in your Vercel project:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time (e.g., "30d")
- Any other environment variables your application uses

### Deployment Steps

1. **Login to Vercel CLI**
   ```
   vercel login
   ```

2. **Deploy to Vercel**
   ```
   npm run vercel-deploy
   ```
   
   Alternatively, you can directly use:
   ```
   vercel --prod
   ```

3. **Link your repository to Vercel** (for automatic deployments)
   - Go to the Vercel dashboard
   - Import your repository
   - Configure the build settings
   - Set environment variables

## Project Structure

- `api/index.js`: The main entry point for serverless functions
- `public/index.html`: Static landing page for the API
- `vercel.json`: Vercel deployment configuration
- `server.js`: Express server setup (used in development and non-Vercel deployments)

## API Routes

- `GET /api/test`: Test if the API is working
- `GET /api/status`: Get API status and environment information
- `POST /api/auth/login`: User authentication
- `GET /api/users`: Get all users (requires authentication)
- `GET /api/students`: Get all students (requires authentication)

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Start the development server: `npm run dev`

## License

© 2023 HMPS School Management System. All rights reserved. 