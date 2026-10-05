# Survey Application - Root README

## Overview
This is a comprehensive survey application comprising both a **backend** and a **frontend** component. The backend is built with NestJS and Prisma, handling database operations and API services. The frontend is built with Angular and provides both a public survey interface and an admin dashboard for survey management.

## Project Components
| Component | Technology | Description |
|-----------|----------|-------------|
| **Backend** | NestJS, Prisma, Node.js | REST API with JWT authentication, MySQL database integration, and admin routes |
| **Frontend** | Angular, Angular Material | Multi-step public survey form and admin dashboard with analytics and QR code generation |
| **Database** | MySQL | Used for persisting survey responses |
| **Authentication** | JWT | Secures admin routes with token-based authentication |
| **HTTP Client** | Angular HttpClient | Communicates with backend API endpoints |

## Project Diagram
```
survey/
├── backend/
│   ├── src/
│   │   ├── app/
│   │   ├── survey/
│   │   └── prisma/
│   ├── prisma/
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/
│   │   │   ├── models/
│   │   │   └── services/
│   │   │   └── features/
│   │   │       ├── survey/
│   │   │   │   │   └── survey-form/
│   │   │   └── admin/
│   │   │       ├── admin/login/
│   │   │   │   ├── survey-list/
│   │   │   │   ├── survey-analytics/
│   │   │   │   └── print-qr/
│   │   │   └── AppRoutingModule
│   │   └── environments/
│   ├── tests/
│   └── angular.json
├── ecosystem.config.js
└── README.md
```

## Quick Start
1. **Backend Setup** (See `backend/README.md`):
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npx prisma generate
   npx prisma migrate dev --name init
   npm run start:dev
   ```

2. **Frontend Setup** (See `frontend/README.md`):
   ```bash
   cd frontend
   npm install
   cp src/environments/environment.ts.example src/environments/environment.ts
   ng serve
   ```

3. Access the application:
   - Public Survey: http://localhost:4200/survey
   - Admin Dashboard: http://localhost:4200/admin/login

## Development Workflow
1. **Backend**
   - Use Prisma migrations for schema changes
   - Maintain JWT secrets in `.env`
   - Follow RESTful API design principles

2. **Frontend**
   - Follow Angular project structure conventions
   - Use Angular Material components consistently
   - Maintain service layer for API communication
   - Use environment variables for API endpoints

3. **Version Control**
   - Use Git for version control
   - Follow semantic versioning
   - Create PRs for review

## Documentation
- Backend Documentation: `backend/README.md`
- Frontend Documentation: `frontend/README.md`
- Full Project Overview: This file (`ROOT/README.md`)
- API Reference: `/api/docs` (Swagger UI)

## Supported by
Carl H. Montelibano Sr. University (CHMSU) Technology Team