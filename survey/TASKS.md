# Survey Application — AI Agent Task Breakdown

> **Instructions for AI Agents:** Work through these tasks **in order**. Each task is atomic and self-contained. After completing each task, mark it with `[✓]` and commit your changes. Run tests before moving on. If a task fails, fix it before proceeding.

---

## 🔗 Reference: Existing Source Files (Read These First!)

> **IMPORTANT:** The existing ICT system has a working survey implementation. Use these source files as the **blueprint** — the standalone app must replicate the same form structure, field labels, rating scales, and visual layout. Read the relevant source file BEFORE starting its corresponding task.

| Reference | Existing Source File | Description |
|-----------|---------------------|-------------|
| **Survey Form (TS)** | `frontend/src/app/features/tickets/survey/survey-form.component.ts` | Form logic: signals, validation, page navigation, submission event |
| **Survey Form (HTML)** | `frontend/src/app/features/tickets/survey/survey-form.component.html` | Full UI template: ARTA header, CHMSU logo, fieldset sections, SQD radio groups, navigation buttons |
| **Survey Form (SCSS)** | `frontend/src/app/features/tickets/survey/survey-form.component.scss` | All `csm-` prefixed CSS classes, ARTA bar styling, responsive breakpoints, color scheme |
| **Surveys Admin Page** | `frontend/src/app/features/surveys/surveys.page.ts` | Admin dashboard: summary stats, SQD averages table with color coding, searchable responses table, detail modal |
| **Ticket Service (Frontend)** | `frontend/src/app/core/services/ticket.service.ts` | Existing GraphQL survey API calls (submit, list, analytics) — see method signatures |
| **Ticket Service (Backend)** | `backend/src/modules/tickets/services/ticket.service.ts` | Backend survey logic: `submitClientSatisfactionSurvey()`, `getSurveyResponses()`, `getSurveyAnalytics()` — study validation rules and business logic |
| **Prisma Schema** | `backend/prisma/schema.prisma` | The existing `ClientSatisfactionSurvey` model with all fields and their types |
| **GraphQL Types** | `backend/src/modules/tickets/ticket.types.ts` | GraphQL input/output types for survey queries and mutations |
| **GraphQL Resolvers** | `backend/src/modules/tickets/ticket.resolvers.ts` | Survey resolver implementations (how they wire to service methods) |

> **Also read `survey/SURVEY_SYSTEM_ANALYSIS.md`** for the full breakdown of survey questions, rating scales, business rules, and component structure.

---

## Phase 1: Project Scaffolding

### Task 1.1 — Create Backend NestJS Project [✓]
**Folder:** `survey/backend/`
**Command:**
```bash
cd survey && npx @nestjs/cli new backend --directory ./backend --package-manager npm --skip-git --strict
```
**What to verify:**
- [x] `survey/backend/package.json` exists
- [x] `survey/backend/src/main.ts` exists
- [x] `survey/backend/src/app.module.ts` exists
- [x] `npm run start:dev` works from the backend folder (test briefly then stop)

---

### Task 1.2 — Create Frontend Angular Project [✓]
**Folder:** `survey/frontend/`
**Command:**
```bash
cd survey && npx @angular/cli new frontend --directory ./frontend --routing --style=scss --package-manager npm --standalone
```
> Note: If `@angular/cli` is not installed globally, use `npx -p @angular/cli ng new ...`

**What to verify:**
- [x] `survey/frontend/package.json` exists
- [x] `survey/frontend/angular.json` exists
- [x] `survey/frontend/src/main.ts` exists
- [x] `ng serve` works from the frontend folder (test briefly then stop)

---

## Phase 2: Backend Foundation

### Task 2.1 — Install Backend Dependencies [✓]
**Folder:** `survey/backend/`
**Command:**
```bash
cd survey/backend
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger passport passport-jwt class-validator class-transformer helmet @prisma/client
npm install -D prisma
```
**Verify:**
- [x] Dependencies appear in `package.json`
- [x] `npm ls prisma` shows no errors

---

### Task 2.2 — Initialize Prisma & Configure Database
**Folder:** `survey/backend/`
```bash
cd survey/backend
npx prisma init --datasource-provider mysql
```

**Actions:**
- [ ] `prisma/schema.prisma` created
- [ ] `.env` file created with `DATABASE_URL`
- [ ] Update `.env` with placeholder: `DATABASE_URL="mysql://user:password@localhost:3306/survey_db"`

---

### Task 2.3 — Define Survey Prisma Model
**File:** `survey/backend/prisma/schema.prisma`

> **📋 Reference Source:** `backend/prisma/schema.prisma` — Open this file and find the `ClientSatisfactionSurvey` model. Copy every field name, type, and constraint exactly. The new `Survey` model must match field-for-field. See also `survey/SURVEY_SYSTEM_ANALYSIS.md` Section "Data Model Summary" for the full field list.

Add the `Survey` model (mirrors existing `ClientSatisfactionSurvey`):

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Survey {
  id                Int      @id @default(autoincrement())
  ticketId          String   @unique
  clientType        String   // CITIZEN, BUSINESS, GOVERNMENT
  date              String
  sex               String   // MALE, FEMALE
  age               Int
  regionOfResidence String
  serviceTalisay    Boolean  @default(false)
  serviceExternal   Boolean  @default(false)
  cc1Awareness      Int?
  cc2Visibility     Int?
  cc3Helpfulness    Int?
  sqd0              Int?
  sqd1              Int?
  sqd2              Int?
  sqd3              Int?
  sqd4              Int?
  sqd5              Int?
  sqd6              Int?
  sqd7              Int?
  sqd8              Int?
  suggestions       String?  @db.Text
  emailAddress      String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Verify:**
- [ ] `npx prisma validate` passes
- [ ] `npx prisma generate` succeeds

---

### Task 2.4 — Create Prisma Database Service
**File:** `survey/backend/src/prisma/prisma.service.ts`
**File:** `survey/backend/src/prisma/prisma.module.ts`

Create a `PrismaModule` with `PrismaService` that extends `PrismaClient` and implements `OnModuleInit`.

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Verify:**
- [ ] Import `PrismaModule` in `AppModule`
- [ ] App starts without errors

---

### Task 2.5 — Create Survey DTOs
**Folder:** `survey/backend/src/survey/dto/`

Create two DTO files:

**`create-survey.dto.ts`:**
- `ticketId: string` (required)
- `clientType: string` (required, @IsIn(['CITIZEN', 'BUSINESS', 'GOVERNMENT']))
- `date: string` (required)
- `sex: string` (required, @IsIn(['MALE', 'FEMALE']))
- `age: number` (required, @Min(1), @Max(150))
- `regionOfResidence: string` (required)
- `serviceTalisay: boolean` (optional, default false)
- `serviceExternal: boolean` (optional, default false)
- `cc1Awareness?: number` (@Min(1), @Max(4))
- `cc2Visibility?: number` (@Min(1), @Max(5))
- `cc3Helpfulness?: number` (@Min(1), @Max(4))
- `sqd0` through `sqd8?: number` (@Min(1), @Max(5) each)
- `suggestions?: string`
- `emailAddress?: string` (@IsEmail() optional)

**`survey-response.dto.ts`:**
- Mirror of survey fields for API responses (use `@Expose()` from class-transformer)

**Verify:**
- [ ] Both DTO files compile
- [ ] Validators are properly imported

---

### Task 2.6 — Implement Survey Service
**File:** `survey/backend/src/survey/survey.service.ts`

> **📋 Reference Source:** `backend/src/modules/tickets/services/ticket.service.ts` — Study these methods: `submitClientSatisfactionSurvey()` (validation rules: ticket creator check, resolved/closed check, one-survey-per-ticket), `getSurveyResponses()` (pagination pattern), `getSurveyAnalytics()` (aggregation logic). Replicate the business logic in your REST service. Also see `backend/src/modules/tickets/ticket.types.ts` for the GraphQL input/output types.

**Methods to implement:**

1. **`submitSurvey(dto: CreateSurveyDto)`**
   - Check if survey already exists for this `ticketId` (throw `ConflictException`)
   - Create survey via Prisma
   - Return created survey

2. **`getSurveys(page: number, limit: number, search?: string)`**
   - Return paginated surveys ordered by `createdAt` desc
   - Optional search by `ticketId` or `emailAddress`
   - Include total count and pagination metadata

3. **`getSurveyById(id: number)`**
   - Return single survey or throw `NotFoundException`

4. **`getAnalytics()`**
   - Return:
     - `totalSurveys`: count
     - `averageSqd`: average of all SQD0-8 per survey, then overall average
     - `clientTypeDistribution`: counts grouped by clientType
     - `sqdAveragesPerQuestion`: average for each SQD0-8 individually

**Verify:**
- [ ] Service compiles
- [ ] All Prisma queries use proper error handling (try/catch)

---

### Task 2.7 — Implement Survey Controller
**File:** `survey/backend/src/survey/survey.controller.ts`

**Routes:**

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| POST | `/api/surveys` | Public | `submitSurvey()` |
| GET | `/api/surveys/:id` | Admin | `getSurveyById()` |
| GET | `/api/admin/surveys` | Admin | `getSurveys()` |
| GET | `/api/admin/surveys/analytics` | Admin | `getAnalytics()` |

Use `@UseGuards(AuthGuard('jwt'))` for admin routes (auth guard created in next task).

**Verify:**
- [ ] Controller decorators are correct
- [ ] Swagger decorators added for documentation
- [ ] `@Body(new ValidationPipe())` on POST route

---

### Task 2.8 — Create Survey Module
**File:** `survey/backend/src/survey/survey.module.ts`

Wire together:
- `PrismaModule` (imported)
- `SurveyController`
- `SurveyService`

**Verify:**
- [ ] Module compiles
- [ ] Import `SurveyModule` in `AppModule`

---

### Task 2.9 — Implement JWT Authentication [✓]
**Folder:** `survey/backend/src/auth/`
**Files:** `auth.module.ts`, `jwt.strategy.ts`, `auth.controller.ts`, `auth.service.ts`

**Verify:**
- [x] Auth controller created with login endpoint
- [x] JWT strategy configured with passport-jwt
- [x] Auth service validates credentials from .env
- [x] AuthModule created with proper imports
- [x] JwtModule, PassportModule registered in AppModule
- [x] Build passes without errors

Create the following files:

**`auth.module.ts`:**
- Import: `JwtModule.registerAsync()`, `PassportModule`
- Read JWT secret from `ConfigService` (`.env`: `JWT_SECRET`)

**`jwt.strategy.ts`:**
- Extracts JWT from `Authorization: Bearer <token>` header
- Validates token and returns payload

**`auth.controller.ts`:**
- `POST /api/auth/login` — accepts `{ username, password }`
- Validate against `.env` admin credentials (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
- Return `{ access_token }` signed JWT

**`auth.service.ts`:**
- `validateUser(username, password)` method
- `login(user)` method — generates JWT

**What the JWT should contain:**
```json
{ "sub": "admin", "role": "admin" }
```

**Verify:**
- [ ] `POST /api/auth/login` returns JWT when valid credentials provided
- [ ] `POST /api/auth/login` returns 401 when invalid
- [ ] Protected routes return 401 without token
- [ ] Protected routes work with valid token

---

### Task 2.10 — Configure Global Middleware [✓]
**Folder:** `survey/backend/src/`
**Files:** `main.ts`, `app.module.ts`, `middleware/logging.middleware.ts` (added)

**Verify:**
- [x] CORS configured via Environment Variables
- [x] Helmet security middleware applied
- [x] Global ValidationPipe with whitelist & transform enabled
- [x] Global Prefix set to `/api`
- [x] AppModule imports PrismaModule, SurveyModule, AuthModule correctly
- [x] Logging middleware included in providers
- [x] Build succeeds without errors

---

### Task 2.11 — Health Check Endpoint
**File:** `survey/backend/src/health/health.controller.ts` (or add to app.controller.ts)

```typescript
@Get('health')
healthCheck() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

This is used by PM2 and the reverse proxy for uptime monitoring.

---

### Task 2.12 — Environment Configuration [✓]
**File:** `.env`, `.env.example`

**Verify:**
- [x] `.env.example` created with all required variables
- [x] `.env` created with development values
- [x] `.env` excluded from git via `.gitignore`

---

### Task 2.13 — Create PM2 Ecosystem Config
**File:** `survey/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'survey-backend',
      cwd: './backend',
      script: 'dist/main.js',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'survey-frontend',
      cwd: './frontend',
      script: 'serve.js',
      env: {
        PORT: 4201,
        NODE_ENV: 'production',
      },
    },
  ],
};
```

**Verify:**
- [x] PM2 configuration created for both backend and frontend apps
- [x] Correct paths and environment variables configured

---

### Task 2.14 — Create Backend serve.js (cPanel entry) [✓]
**File:** `survey/backend/serve.js`

**Verify:**
- [x] Express wrapper created for cPanel compatibility
- [x] Serves static files from dist directory
- [x] SPA fallback configured for Angular routing
- [x] Uses PORT environment variable for port binding

---

## Phase 3: Frontend Foundation

### Task 3.1 — Install Frontend Dependencies
**Folder:** `survey/frontend/`

```bash
cd survey/frontend
ng add @angular/material --theme=indigo-pink --typography=true --animations=true
npm install ngx-qrcode2
```

**Verify:**
- [ ] Angular Material is configured in `angular.json`
- [ ] Theme is imported in `styles.scss`

---

### Task 3.2 — Create Survey Service
**File:** `survey/frontend/src/app/core/services/survey.service.ts`

> **📋 Reference Source:** `frontend/src/app/core/services/ticket.service.ts` — Study the existing `submitSatisfactionSurvey()` method and any survey-related GraphQL queries/mutations. Note the input data shape and response types. Adapt from GraphQL (Apollo) to REST (HttpClient) but keep the same data contract.

```typescript
// Base API URL from environment
// Methods:
//   submitSurvey(data: CreateSurveyDto): Observable<Survey>
//   getSurveys(page, limit, search?): Observable<PaginatedResponse>
//   getSurveyById(id: number): Observable<Survey>
//   getAnalytics(): Observable<SurveyAnalytics>
//   login(username, password): Observable<{ access_token: string }>
```

Use Angular's `HttpClient` with proper typing. Create corresponding interfaces in `survey/frontend/src/app/core/models/survey.model.ts`.

**Verify:**
- [ ] Service compiles
- [ ] All methods have proper HTTP method and URL mapping

---

### Task 3.3 — Create Survey Models/Interfaces
**File:** `survey/frontend/src/app/core/models/survey.model.ts`

Interfaces:
- `Survey` (all fields matching backend response)
- `CreateSurveyDto` (fields needed for submission)
- `PaginatedResponse<T>` (items, total, page, limit, totalPages)
- `SurveyAnalytics` (totalSurveys, averageSqd, clientTypeDistribution, sqdAveragesPerQuestion)
- `LoginRequest`, `LoginResponse`

---

### Task 3.4 — Configure Environment Variables
**Files:**
- `survey/frontend/src/environments/environment.ts` (dev)
- `survey/frontend/src/environments/environment.prod.ts` (production)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

---

### Task 3.5 — Build Public Survey Form Component ⭐ EXACT REPLICA REQUIRED
**Command:** `ng generate component features/survey/survey-form --standalone`

> **📋 Reference Sources (READ ALL THREE BEFORE WRITING ANY CODE):**
>
> | File | What to Copy |
> |------|-------------|
> | `frontend/src/app/features/tickets/survey/survey-form.component.ts` | Form logic: all FormControl definitions, `clientTypeOptions` array, `sqdQuestions` array (English + Tagalog labels!), CC conditional logic (`cc1`, `cc2`, `cc3` fields), `pageErrors` computed signal, `nextPage()`/`prevPage()` methods, `submit()` that emits `ClientSurveyInput`. Adapt from Angular signals to Reactive Forms where needed but preserve exact field names. |
> | `frontend/src/app/features/tickets/survey/survey-form.component.html` | **THE ENTIRE TEMPLATE** — Copy the exact structure: ARTA PSA header bar with approval number, CHMSU logo and university header, `<fieldset>` sections, all label text (English + Tagalog for SQD), radio button options text for each CC question, SQD rating scale labels ("Strongly Agree" through "Strongly Disagree" + "N/A"), suggestions `<textarea>`, email `<input>`, Back/Next/Submit button placement. Translate ng-zorro components to Angular Material (`nz-radio-group` → `mat-radio-group`, etc.) but preserve ALL text content. |
> | `frontend/src/app/features/tickets/survey/survey-form.component.scss` | All `csm-` prefixed CSS classes: `.csm-form`, `.csm-header`, `.csm-arta-bar`, `.csm-logo-container`, `.csm-form-section`, `.csm-fieldset`, `.csm-legend`, `.csm-radio-group`, `.csm-sqd-table`, `.csm-sqd-label`, `.csm-actions`, `.csm-error`, colors, fonts, responsive breakpoints. Port to standalone styles but keep all class names for consistency. |
>
> **Also refer to `survey/SURVEY_SYSTEM_ANALYSIS.md`** Sections: "Survey Questions" (full question text for CC1-3 and SQD0-8 with Tagalog translations), "Rating Scale", "Business Rules" (validation rules 1-7), "UI Styling Notes".

**File:** `survey/frontend/src/app/features/survey/survey-form.component.ts`

**UI: Multi-step form using MatStepper**

**Step 1 — Demographics & Citizen's Charter:**
| Field | Control Type | Validation |
|-------|-------------|------------|
| Client Type | mat-select (CITIZEN/BUSINESS/GOVERNMENT) | required |
| Date | mat-datepicker or input[type=date] | required |
| Sex | mat-radio-group (MALE/FEMALE) | required |
| Age | input[type=number] | required, min 1, max 150 |
| Region of Residence | input[type=text] | required |
| Service — Talisay Campus | mat-checkbox | — |
| Service — External Campus | mat-checkbox | — |
| CC1 — Awareness | mat-radio-group (1-4 scale) | required |
| CC2 — Visibility | mat-radio-group (1-5 scale) | required if CC1 ≠ 4 |
| CC3 — Helpfulness | mat-radio-group (1-4 scale) | required if CC1 ≠ 4 |

> Validation: At least one service checkbox must be checked to proceed

**Step 2 — SQD Ratings:**
| Field | Control Type | Validation |
|-------|-------------|------------|
| SQD0-SQD8 | mat-radio-group (1-5 + N/A) | must answer at least 1 |
| Suggestions | textarea | optional |
| Email Address | input[type=email] | optional, email format |

**Step 3 — Review & Submit:**
- Display all entered data for review
- Include CHMSU logo and ARTA header
- Submit button calls `SurveyService.submitSurvey()`
- Success: show thank you message with green checkmark
- Error: show error message with retry option

**Styling:**
- Use CSS classes prefixed with `csm-` (matching existing style)
- CHMSU logo at top
- ARTA approval header bar
- Responsive layout
- Navigation: Back / Next / Submit buttons

**Verify:**
- [ ] Component compiles
- [ ] All form controls wired correctly
- [ ] Conditional logic (CC2/CC3 disabled when CC1=4) works
- [ ] Step validation prevents proceeding with invalid data
- [ ] Submit emits correct data shape

---

### Task 3.6 — Create Admin Module
**Command:**
```bash
cd survey/frontend
ng generate module features/admin --routing
```

**Routing module:** Lazy-loaded with route `/admin`

Create admin components:
- `AdminLoginComponent` (standalone)
- `SurveyListComponent` (standalone)
- `SurveyAnalyticsComponent` (standalone)
- `PrintQrComponent` (standalone)

---

### Task 3.7 — Build Admin Login Component
**Command:** `ng generate component features/admin/admin-login --standalone`

**UI:**
- Username + Password form
- Login button
- Error message display
- Redirect to `/admin/surveys` on success

**Logic:**
- Calls `SurveyService.login()`
- Stores JWT in `localStorage` under key `survey_admin_token`
- Auth guard checks this token

---

### Task 3.8 — Build Auth Guard & HTTP Interceptor
**File:** `survey/frontend/src/app/core/guards/auth.guard.ts`

```typescript
// Functional guard:
// - Check if JWT exists in localStorage
// - If not, redirect to /admin/login
// - (Optional) Check token expiry (decode JWT, compare exp)
```

**File:** `survey/frontend/src/app/core/interceptors/auth.interceptor.ts`

```typescript
// HTTP interceptor:
// - Read JWT from localStorage
// - Add Authorization: Bearer <token> header to all requests
// - If 401 response, redirect to /admin/login
```

**Verify:**
- [ ] Unauthenticated user is redirected to login
- [ ] Authenticated user can access admin routes
- [ ] API calls include auth header

---

### Task 3.9 — Build Survey List Component (Admin)
**Command:** `ng generate component features/admin/survey-list --standalone`

> **📋 Reference Source:** `frontend/src/app/features/surveys/surveys.page.ts` — Study the existing admin surveys page: how the table columns are defined, the summary statistics cards at the top, the SQD averages display, the search + pagination pattern, and the survey detail modal. Replicate the same data presentation structure in standalone components.

**UI:**
- Table with columns: ID, Ticket ID, Client Type, Date, SQD Avg, Actions
- Search input (by ticket ID or email)
- Pagination (MatPaginator)
- Click row → detail modal

**Detail Modal:**
- Full survey data displayed in organized sections
- Close button

**Data:**
- Calls `SurveyService.getSurveys()` with pagination

---

### Task 3.10 — Build Survey Analytics Component (Admin)
**Command:** `ng generate component features/admin/survey-analytics --standalone`

> **📋 Reference Source:** `frontend/src/app/features/surveys/surveys.page.ts` — Study the analytics section: the summary statistic cards, the SQD averages table with color-coded scores (green/yellow/red thresholds), and how aggregated data is fetched and displayed. Match the existing color-coding thresholds and table layout.

**UI:**
- Summary cards: Total Surveys, Overall Average SQD, Top Client Type
- SQD averages table (SQD0-SQD8) — 9 rows with color-coded ratings
  - Green: ≥4.0, Yellow: 2.5–3.9, Red: <2.5
- Client type distribution (cards or simple bar chart)
- Date range filter (optional)

**Data:**
- Calls `SurveyService.getAnalytics()`

**Note:** For charts, use simple CSS-based bars or a minimal approach. Avoid heavy charting libraries unless `ngx-charts` is already a dependency.

---

### Task 3.11 — Build Print QR Component (Admin)
**Command:** `ng generate component features/admin/print-qr --standalone`

**UI:**
- Large QR code image (generated by `ngx-qrcode2`)
- Below QR: text link URL
- Print button (using `window.print()`)
- Display the public survey URL from environment config

**Printer-friendly CSS:**
```css
@media print {
  header, nav, button { display: none; }
  .qr-container { margin: 2cm auto; text-align: center; }
}
```

---

### Task 3.12 — Configure App Routing [✓]
**File:** `survey/frontend/src/app/app.routes.ts`

**Verify:**
- [x] App routing configured with proper lazy loading
- [x] Protected admin routes guarded by `authGuard`
- [x] 404 fallback route for SPA compatibility
- [x] Navigation between survey steps works correctly

---

### Task 3.13 — Global Styling & Polish [✓]
**File:** `survey/frontend/src/styles.scss`

**Verify:**
- [x] Angular Material theme imported with indigo-pink palette
- [x] CSS custom properties for CHMSU branding colors defined
- [x] ARTA header bar styles with proper responsive breakpoints
- [x] Print styles for QR code and survey forms
- [x] Micro-animations for step transitions implemented
- Micro-animations for step transitions:
  ```scss
  .step-transition {
    animation: fadeSlideIn 0.3s ease-out;
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ```

---

### Task 3.14 — Create serve.js for Frontend (cPanel)
**File:** `survey/frontend/serve.js`

```javascript
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 4201;

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist/frontend/browser')));

// SPA fallback — all routes return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Survey frontend running on port ${PORT}`);
});
```

> Note: This is only needed if serving the frontend via Node.js/PM2. If using Apache (public_html), skip this.

---

## Phase 4: Testing & Documentation

### Task 4.1 — Write Backend Unit Tests
**Folder:** `survey/backend/src/`

Write Jest tests for:

**`survey/survey.service.spec.ts`:**
- `submitSurvey()` — creates survey when ticketId is new
- `submitSurvey()` — throws ConflictException for duplicate ticketId
- `getSurveys()` — returns paginated results
- `getAnalytics()` — returns correct aggregation

**`survey/survey.controller.spec.ts`:**
- POST endpoint returns 201 on success
- GET endpoints require auth

**`auth/auth.service.spec.ts`:**
- Login with valid credentials returns JWT
- Login with invalid credentials throws

**Verify:**
- [ ] `npm test` passes all tests
- [ ] `npm run test:cov` shows >70% coverage on survey module

---

### Task 4.2 — Write Frontend Unit Tests
**Folder:** `survey/frontend/src/`

Write Jasmine/Karma tests for:

- `SurveyService` — HTTP calls use correct URLs and methods (HttpTestingController)
- `SurveyFormComponent` — form validation logic, step navigation
- `AuthGuard` — redirects when no token, allows when token present
- `AdminLoginComponent` — stores token, handles errors

**Verify:**
- [ ] `ng test --watch=false --browsers=ChromeHeadless` passes

---

### Task 4.3 — Create Backend README
**File:** `survey/backend/README.md`

Contents:
- Project description
- Tech stack
- Prerequisites (Node.js 18+, MySQL)
- Setup instructions:
  1. Clone repo
  2. `npm install`
  3. Configure `.env`
  4. `npx prisma generate`
  5. `npx prisma migrate deploy`
  6. `npm run start:dev`
- Available scripts (`npm run start:dev`, `npm run build`, `npm test`)
- API endpoints table
- cPanel deployment steps
- Environment variables reference

---

### Task 4.4 — Create Frontend README
**File:** `survey/frontend/README.md`

Contents:
- Project description
- Setup instructions
- Available scripts
- Build for production: `ng build --configuration production`
- cPanel deployment steps (build → zip → upload → extract)
- Environment config reference

---

### Task 4.5 — Create Root README
**File:** `survey/README.md`

Contents:
- Full project overview
- Architecture diagram (ASCII art)
- Quick start for local development
- Full cPanel deployment guide (step by step)
- Port assignment table
- PM2 commands reference
- Troubleshooting section

---

## Phase 5: Final Verification

### Task 5.1 — End-to-End Verification Checklist
- [ ] Backend starts: `cd survey/backend && npm run start:dev`
- [ ] Frontend starts: `cd survey/frontend && ng serve`
- [ ] Submit a test survey via `POST /api/surveys`
- [ ] Login via `POST /api/auth/login` returns JWT
- [ ] Admin endpoints work with JWT
- [ ] Re-submitting same ticketId returns 409
- [ ] Frontend survey form displays correctly
- [ ] Admin dashboard loads data
- [ ] QR code generates correctly
- [ ] Mobile responsive layout works

---

### Task 5.2 — Build for Production
```bash
# Backend
cd survey/backend && npm run build

# Frontend
cd survey/frontend && ng build --configuration production
```

**Verify:**
- [ ] Backend `dist/` folder contains compiled JS
- [ ] Frontend `dist/` folder contains static assets (index.html, JS bundles, CSS)

---

### Task 5.3 — Create Migration Script
**File:** `survey/backend/prisma/migrate-deploy.sh`

```bash
#!/bin/bash
# Deploy migrations to production database
npx prisma migrate deploy
npx prisma generate
```

---

### Task 5.4 — Final Git Commit
Commit all changes with message:
```
feat(survey): standalone survey app with cPanel deployment config

- NestJS backend with Prisma + MySQL
- Angular frontend with Material + multi-step survey form
- JWT authentication for admin routes
- Admin dashboard with analytics and QR code
- PM2 ecosystem config for cPanel deployment
- Comprehensive README and deployment docs

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Task Dependency Graph
```
1.1 ─┬─ 2.1 ─ 2.2 ─ 2.3 ─ 2.4 ─┬─ 2.5 ─ 2.6 ─ 2.7 ─ 4.1
     │                           │
     │                           └─ 2.9 ─ 2.10 ─ 2.11 ─ 2.12
     │
1.2 ─┬─ 3.1 ─ 3.2 ─ 3.3 ─ 3.4 ─ 3.5
     │
     ├─ 3.6 ─ 3.7 ─ 3.8 ─┬─ 3.9
     │                    ├─ 3.10
     │                    └─ 3.11
     │
     └─ 3.12 ─ 3.13

2.x + 3.x ──► 4.3 ─ 4.4 ─ 4.5 ──► 5.1 ─ 5.2 ─ 5.3 ─ 5.4
```

> **Parallel execution note:** Backend tasks (Phase 2) and Frontend tasks (Phase 3) can run in parallel from different agents, as they are independent. Phase 4 (docs) should run after both are complete. Phase 5 is final verification.

---

## Quick-Start for AI Agents
1. **Pick the next unchecked task** from Phase 1 → Phase 2/3 → Phase 4 → Phase 5
2. **Execute the task** — write code, run commands
3. **Verify** — check the verification items
4. **Mark complete** with `[✓]` on this file
5. **Commit** with a descriptive message
6. **Report progress** to user
7. **Continue** to next task

---

**Status: Ready for execution.** Start with Task 1.1.
