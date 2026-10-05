# Survey API - Backend README

## Overview
This project implements a standalone survey application with backend services written in NestJS and frontend built with Angular. This document provides guidance on setting up, configuring, and deploying the backend.

## Tech Stack
- **NestJS**: Backend framework
- **Prisma**: ORM for MySQL database
- **JWT**: Authentication for admin routes
- **Helmet & CORS**: Security and cross-origin handling
- **Swagger**: API documentation

## Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

## Setup Instructions
1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other environment variables.
5. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Start the development server:
   ```bash
   npm run start:dev
   ```

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:password@localhost:3306/survey` |
| `JWT_SECRET` | JWT signing key | `change-me-to-a-random-string` |
| `JWT_EXPIRATION` | Token expiration | `8h` |
| `PORT` | Server port | `3000` |
| `CORS_ORIGINS` | CORS-allowed origins | `http://localhost:4200,https://survey.example.edu` |
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password | `change-me` |

## Available Scripts
| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start NestJS app in development mode with auto-reload |
| `npm run build` | Build the NestJS application |
| `npm run start:prod` | Start the built NestJS application in production mode |
| `npm run test` | Run Jest unit tests |
| `npm run test:cov` | Run Jest tests with code coverage |
| `npm run prune` | Remove dependencies (use with caution) |

## API Documentation
The API documentation is available at `/api/docs` when the server is running.

### Key Endpoints
- `POST /api/auth/login` - Generate JWT for admin login
- `GET /api/surveys` - List flexibility surveys (admin only)
- `POST /api/surveys` - Submit new survey (public)
- `GET /api/admin/surveys/:id` - Get survey by ID (admin only)
- `GET /api/admin/surveys/analytics` - Get survey analytics (admin only)
- `GET /api/health` - Health check endpoint

## Project Structure
```
backend/
├── src/
│   ├── app/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── app.service.ts
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── prisma/
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   ├── prisma.module.ts
│   │   └── schema.prisma
│   ├── survey/
│   │   ├── dto/
│   │   ├── survey.service.ts
│   │   ├── survey.controller.ts
│   │   ├── survey.module.ts
│   │   └── survey.schema.prisma
│   └── middleware/
│       └── logging.middleware.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── tests/
│   └── *.spec.ts
└── package.json
```

## Testing
Run Jest tests with:
```bash
npm run test
```

Run tests with code coverage:
```bash
npm run test:cov
```

## Deployment
For deployment instructions, see `BACKEND_DEPLOYMENT.md` (coming soon).

## License
MIT License