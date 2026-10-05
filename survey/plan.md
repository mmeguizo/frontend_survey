# Standalone Survey Application – Implementation Plan

## 1. Goal & Scope
- Deliver a **standalone** web application for university surveys.
- Front-end: **Angular** (standalone components, Angular Material for premium UI).
- Back-end: **NestJS** + **Prisma** ORM on **MySQL**.
- Provide a **public QR-code / link** that opens the survey (no auth required).
- Admin dashboard for analytics (protected, staff-only).
- Follow best-practice patterns: modular architecture, validation, error handling, CI, testing, linting.

---

## 2. High-Level Architecture
```
┌─────────────────────┐   HTTP   ┌─────────────────────┐
│   Angular Front-end │◄───────►│   NestJS REST API   │
│  (public & admin)  │        │  (Prisma + MySQL)   │
└─────────────────────┘        └─────────────────────┘
```
- **Public Survey Page**: `/survey` – accessible via QR-code link.
- **Admin Dashboard**: `/admin/surveys` – JWT-protected.
- **Database**: MySQL instance (shared with existing system or dedicated).

---

## 3. Project Structure
```
survey/
├── plan.md                    # This file
├── TASKS.md                   # Detailed task breakdown for AI agents
├── SURVEY_SYSTEM_ANALYSIS.md  # Reference: existing survey system analysis
├── frontend/                  # Angular application
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
└── backend/                   # NestJS application
    ├── src/
    ├── prisma/
    ├── package.json
    └── ...
```

---

## 4. Technology Stack
| Layer | Technology |
|-------|-----------|
| Frontend Framework | Angular 18+ (standalone components) |
| UI Library | Angular Material |
| Backend Framework | NestJS |
| ORM | Prisma |
| Database | MySQL |
| Auth | JWT (Passport.js) |
| Process Manager (cPanel) | PM2 |
| Reverse Proxy | cPanel Apache / Nginx (configured by admin) |

---

## 5. cPanel Deployment Strategy

### 5.1 Overview
Unlike the original Docker-based plan, this app will be deployed to a **cPanel shared hosting** environment where other apps are already running. Each service runs as a Node.js process on its own port. A domain admin assigns domain/subdomain names to each running port.

### 5.2 Deployment Steps

#### Frontend Deployment
1. Build the Angular app locally: `ng build --configuration production`
2. The build output goes to `frontend/dist/` folder
3. Compress the production build into a `.zip` file
4. Upload to cPanel via **File Manager** → `public_html/survey/`
5. Extract the zip — the Angular app is now served as static files
6. No port needed for frontend — Apache/Nginx serves static files directly
7. Domain admin assigns: `https://survey.example.edu` → `public_html/survey/`

**Alternative (recommended for SPAs):**
1. Build and zip the Angular app
2. Create a simple `serve.js` using Express to serve static files with fallback to `index.html` (for Angular routing)
3. Upload the folder to cPanel (outside `public_html`, e.g. `/home/user/survey-frontend/`)
4. Install dependencies: `cd /home/user/survey-frontend && npm install`
5. Start with PM2 on a unique port: `pm2 start serve.js --name survey-frontend -- --port 4201`
6. Domain admin assigns subdomain → reverse proxy to `localhost:4201`

#### Backend Deployment
1. Upload the backend folder to cPanel (outside `public_html`, e.g. `/home/user/survey-backend/`)
2. Open cPanel **Terminal**:
   ```
   cd /home/user/survey-backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   ```
3. Start with PM2 on a unique port:
   ```
   pm2 start dist/main.js --name survey-backend -- --port 3000
   ```
4. Verify: `curl http://localhost:3000/api/health`
5. Domain admin assigns subdomain (e.g. `https://api-survey.example.edu`) → reverse proxy to `localhost:3000`

### 5.3 Port Management
| Service | Default Port | Description |
|---------|-------------|-------------|
| survey-backend | 3000 | NestJS REST API |
| survey-frontend (if Express) | 4201 | Angular SSR / static serve |
| Existing ICT Backend | (varies) | Main app backend |
| Existing ICT Frontend | (varies) | Main app frontend |

> **Important:** Before starting, check which ports are already in use via cPanel Terminal: `pm2 list` and `netstat -tlnp`. Pick available ports.

### 5.4 PM2 Process Management
```bash
# Start backend
pm2 start dist/main.js --name survey-backend

# Save PM2 process list (survives server reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# View logs
pm2 logs survey-backend

# Restart after update
pm2 restart survey-backend
```

### 5.5 Environment Variables
Create a `.env` file in the backend folder on cPanel:
```env
DATABASE_URL="mysql://user:password@localhost:3306/survey_db"
JWT_SECRET="your-secret-key-here"
PORT=3000
CORS_ORIGINS="https://survey.example.edu"
```

### 5.6 Database
- Use cPanel's **MySQL Databases** to create a new database (e.g. `survey_db`)
- Use cPanel's **phpMyAdmin** or terminal for manual DB operations if needed
- Prisma migrations handle schema creation: `npx prisma migrate deploy`

### 5.7 cPanel Reverse Proxy (for admin to configure)
The domain admin will use cPanel's **"Application Manager"** or manually configure Apache mod_proxy:
```
# In .htaccess or Apache config for api-survey.example.edu:
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
```

---

## 6. Backend Tasks (NestJS + Prisma)

| # | Task | Description |
|---|------|-------------|
| 1 | **Scaffold NestJS project** | `npx @nestjs/cli new backend --directory ./survey/backend --package-manager npm --skip-git` |
| 2 | **Install dependencies** | `npm i @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger passport passport-jwt class-validator class-transformer helmet` |
| 3 | **Add Prisma** | `npm i -D prisma` and `npm i @prisma/client` |
| 4 | **Init Prisma** | `npx prisma init --datasource-provider mysql` |
| 5 | **Define Survey model** | Create `Survey` model in `prisma/schema.prisma` mirroring `ClientSatisfactionSurvey` fields |
| 6 | **Create Survey module** | `nest g module survey`, `nest g controller survey`, `nest g service survey` |
| 7 | **Implement DTOs** | `CreateSurveyDto` with all survey fields + class-validator decorators |
| 8 | **Implement Prisma service** | Database service wrapping Prisma client |
| 9 | **Implement survey service** | `submitSurvey()`, `getSurveys(pagination)`, `getAnalytics()` |
| 10 | **Implement survey controller** | `POST /api/surveys`, `GET /api/admin/surveys`, `GET /api/admin/surveys/analytics` |
| 11 | **Add JWT auth** | Auth module, JWT strategy, login endpoint, guards for admin routes |
| 12 | **CORS & Security** | Helmet, CORS config via `.env`, rate limiting on public endpoints |
| 13 | **Validation pipe** | Global `ValidationPipe` for DTO validation |
| 14 | **Health endpoint** | `GET /api/health` for PM2/monitoring checks |
| 15 | **Swagger docs** | OpenAPI documentation via `@nestjs/swagger` |
| 16 | **Environment config** | `.env.example` with all required variables |
| 17 | **serve.js (cPanel)** | Simple Express entry point for port-based serving (optional) |
| 18 | **Unit tests** | Jest tests for service methods |
| 19 | **Prisma migration** | `npx prisma migrate dev --name init` and seed script |
| 20 | **README** | Setup and deployment instructions |

---

## 7. Frontend Tasks (Angular)

| # | Task | Description |
|---|------|-------------|
| 1 | **Scaffold Angular project** | `ng new frontend --directory ./survey/frontend --routing --style=scss` |
| 2 | **Add Angular Material** | `ng add @angular/material` with indigo-pink theme |
| 3 | **Create Survey module** | Feature module with routing for public survey |
| 4 | **Build Survey Form** | Multi-step form using `MatStepper` — demographics, CC, SQD, suggestions |
| 5 | **Reactive Forms** | FormGroup, custom validators for all survey fields |
| 6 | **Survey service** | `SurveyService` wrapping `HttpClient` calls to backend REST API |
| 7 | **Create Admin module** | Feature module with routing, protected by auth guard |
| 8 | **Admin dashboard** | Survey list component with pagination, search, detail modal |
| 9 | **Analytics component** | Charts/stats for aggregated survey data |
| 10 | **QR Code component** | Printable QR code linking to public survey page |
| 11 | **Auth guard & interceptor** | JWT storage, route guard, HTTP interceptor for Bearer token |
| 12 | **Login page** | Staff login form hitting `/api/auth/login` |
| 13 | **Styling & polish** | Custom CSS variables, responsive layout, micro-animations |
| 14 | **Environment config** | `environment.ts` / `environment.prod.ts` with API URLs |
| 15 | **serve.js (cPanel)** | Optional Express server for SPA fallback routing |
| 16 | **Unit tests** | Karma/Jasmine tests for components and services |
| 17 | **README** | Build and deployment instructions |

---

## 8. QR-Code / Link Strategy
1. **Public URL** — `https://survey.example.edu/survey` (configured via environment variable).
2. **Generate QR Code** on the admin dashboard using `ngx-qrcode2`; the QR image can be printed and displayed in offices.
3. **Fallback Link** — Under the QR image, provide a clickable text link for users who cannot scan.
4. **No authentication needed** for the public page.

---

## 9. Acceptance Criteria
- **Public Survey** reachable via QR-code or link, submits without login.
- **One submission per ticket/email** enforced server-side.
- **Admin dashboard** shows paginated list, aggregate analytics, printable QR code.
- **All unit tests** pass (`npm test` both front-end and back-end).
- **PM2 deployment** — both services run via PM2 on cPanel, survive reboots.
- **Documentation** complete with cPanel deployment instructions.

---

## 10. cPanel Deployment Checklist
- [ ] Backend folder uploaded to cPanel outside `public_html`
- [ ] `npm install` completed on server
- [ ] Prisma migration deployed to MySQL
- [ ] `.env` configured with production values
- [ ] PM2 running backend on unique port
- [ ] Frontend built and deployed to `public_html/survey/` (or served via Express/PM2)
- [ ] CORS configured to allow frontend domain
- [ ] Domain/subdomain assigned to each service
- [ ] HTTPS configured via cPanel SSL
- [ ] Health check endpoint responding
- [ ] QR code prints and links correctly
- [ ] `pm2 save` executed for reboot persistence

---

**Status:** Ready for execution — see `TASKS.md` for detailed task breakdown.
