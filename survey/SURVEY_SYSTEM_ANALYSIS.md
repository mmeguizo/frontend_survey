# Survey System Analysis

## Overview
This document captures the existing survey system within the ICT ticketing application so an AI agent can plan a standalone architecture without exploring the entire codebase.

## Current System Architecture

### Frontend (Angular + Ng-Zorro)
The survey system consists of two main UI components:

#### 1. Survey Form Component (`survey-form.component`)
- **Location:** `frontend/src/app/features/tickets/survey/`
- **Files:**
  - `survey-form.component.ts` — Form logic (signals, validation, submission)
  - `survey-form.component.html` — UI template
  - `survey-form.component.scss` — Styling
- **Purpose:** Embedded in the ticket detail page; allows ticket creators to submit a Client Satisfaction Measurement (CSM) survey after ticket resolution
- **Structure:**
  - **Page 1 (Demographics):**
    - Client type (Citizen/Business/Government)
    - Date, Sex, Age, Region of residence
    - Service availed (Talisay Campus / External Campus)
    - Citizen's Charter questions (CC1: Awareness, CC2: Visibility, CC3: Helpfulness)
  - **Page 2 (SQD Ratings):**
    - 9 Service Quality Dimension questions (SQD0–SQD8)
    - 5-point scale: Strongly Agree → Strongly Disagree + N/A option
    - Optional suggestions text area
    - Optional email address field
  - **Navigation:** Back / Next / Submit buttons
  - **Validation:**
    - Page 1: At least one service must be selected
    - Page 2: At least one SQD question must be answered
  - **Emitted Output:** `submitted` event with `ClientSurveyInput` object
  - **Dependencies:**
    - Angular `FormsModule`, `CommonModule`
    - Ng-Zorro: `NzButtonModule`, `NzIconModule`, `NzMessageService`

#### 2. Surveys Admin Page (`surveys.page.ts`)
- **Location:** `frontend/src/app/features/surveys/`
- **File:** `surveys.page.ts` (inline template)
- **Purpose:** Admin/staff dashboard for viewing survey analytics and responses
- **Features:**
  - Summary statistics (total surveys, average SQD scores)
  - SQD averages table with color-coded ratings
  - Searchable survey responses table with pagination
  - Survey detail modal showing full response breakdown
- **GraphQL Queries:**
  - `SurveyResponses` — Paginated list of survey responses
  - `SurveyAnalytics` — Aggregated analytics data
- **Dependencies:**
  - Apollo Angular (`apollo-angular`)
  - Ng-Zorro modules: Card, Table, Tag, Statistic, Grid, Spin, Empty, Input, DatePicker, Button, Modal, Descriptions, Divider
  - Angular pipes: `DatePipe`, `DecimalPipe`

#### 3. Ticket Detail Integration (`ticket-detail.page.ts`)
- **Location:** `frontend/src/app/features/tickets/`
- **Purpose:** Shows the survey form in a modal when a ticket is resolved/closed
- **Logic:**
  - Checks if the current user is the ticket creator
  - Checks if the ticket is resolved/closed
  - Checks if a survey hasn't already been submitted
  - Calls backend mutation to submit survey data

### Backend (NestJS + GraphQL + Prisma)
The survey system is embedded in the tickets module.

#### 1. Prisma Model
- **Location:** `backend/prisma/schema.prisma`
- **Model:** `ClientSatisfactionSurvey`
- **Fields:**
  - `id`, `ticketId` (foreign key to Ticket)
  - `userId` (who submitted the survey)
  - Demographics: `clientType`, `date`, `sex`, `age`, `regionOfResidence`
  - Services: `serviceTalisay`, `serviceExternal` (booleans)
  - CC Questions: `cc1Awareness`, `cc2Visibility`, `cc3Helpfulness`
  - SQD Ratings: `sqd0`–`sqd8`
  - Feedback: `suggestions`, `emailAddress`
  - Timestamps: `createdAt`, `updatedAt`

#### 2. Service Layer (`ticket.service.ts`)
- **Location:** `backend/src/modules/tickets/services/`
- **Key Methods:**
  - `submitSatisfactionSurvey()` — Legacy star rating (backward compatibility)
  - `submitClientSatisfactionSurvey()` — Full ARTA CSM survey submission
    - Validates: ticket creator only, ticket must be resolved/closed, one survey per ticket
  - `getSurveyResponses()` — Paginated survey responses for admin
  - `getSurveyAnalytics()` — Aggregated analytics (total, averages, CC distribution)

#### 3. GraphQL Schema (`ticket.types.ts`)
- **Location:** `backend/src/modules/tickets/`
- **Queries:**
  - `surveyResponses(pagination: PaginationInput): SurveyResponseList`
  - `surveyAnalytics(filter: AnalyticsFilterInput): SurveyAnalytics`
- **Mutations:**
  - `submitSatisfactionSurvey()` — Legacy
  - `submitClientSatisfactionSurvey()` — Full ARTA CSM survey

#### 4. Resolvers (`ticket.resolvers.ts`)
- **Location:** `backend/src/modules/tickets/`
- **Survey Resolvers:**
  - `surveyResponses` — Returns paginated survey data with ticket/user info
  - `surveyAnalytics` — Returns aggregated statistics
  - `submitSatisfactionSurvey` — Mutation for legacy survey
  - `submitClientSatisfactionSurvey` — Mutation for full ARTA CSM survey

### Ticket Service (Frontend)
- **Location:** `frontend/src/app/core/services/ticket.service.ts`
- **Purpose:** HTTP/GraphQL client for survey-related API calls
- **Methods:**
  - `submitSatisfactionSurvey()` — Calls backend mutation

## Data Model Summary

```
ClientSatisfactionSurvey
├── id (PK)
├── ticketId (FK → Ticket)
├── userId (FK → User)
├── clientType (enum: CITIZEN | BUSINESS | GOVERNMENT)
├── date (String)
├── sex (enum: MALE | FEMALE)
├── age (Int)
├── regionOfResidence (String)
├── serviceTalisay (Boolean)
├── serviceExternal (Boolean)
├── cc1Awareness (Int)
├── cc2Visibility (Int)
├── cc3Helpfulness (Int)
├── sqd0–sqd8 (Int)
├── suggestions (String)
├── emailAddress (String)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

## Survey Questions

### Page 1 — Demographics & Citizen's Charter
1. **Client Type:** Citizen / Business / Government
2. **Date:** Date of visit
3. **Sex:** Male / Female
4. **Age:** Numeric
5. **Region of Residence:** Text
6. **Service Availed:** 
   - Request for ICT Support Services for Talisay Campus
   - Request for ICT Support Services for External Campus
7. **CC1 — Awareness:**
   - 1: I know what a CC is and I saw this office's CC
   - 2: I know what a CC is but I did NOT see this office's CC
   - 3: I learned of the CC only when I saw this office's CC
   - 4: I do not know what a CC is and I did not see one in this office
8. **CC2 — Visibility (if CC1 = 1-3):**
   - 1: Easy to see
   - 2: Somewhat easy to see
   - 3: Difficult to see
   - 4: Not visible at all
   - 5: N/A
9. **CC3 — Helpfulness (if CC1 = 1-3):**
   - 1: Helped very much
   - 2: Somewhat helped
   - 3: Did not help
   - 4: N/A

### Page 2 — Service Quality Dimensions (SQD)
| Key | English Question | Tagalog Translation |
|-----|-----------------|---------------------|
| SQD0 | I am satisfied with the service that I availed | Nasiyahan ako sa serbisyo na aking natanggap |
| SQD1 | I spent a reasonable amount of time for my transaction | Makatwiran ang oras na aking ginugol |
| SQD2 | The office followed the transaction's requirements and steps | Ang opisina ay sumusunod sa mga kinakailangan |
| SQD3 | The steps (including payment) were easy and simple | Ang mga hakbang sa pagproseso ay madali |
| SQD4 | I easily found information about my transaction | Mabilis at madali akong nakahanap ng impormasyon |
| SQD5 | I paid a reasonable amount of fees for my transaction | Nagbayad ako ng makatwirang halaga |
| SQD6 | I feel the office was fair to everyone ("walang palakasan") | Pakiramdam ko ay patas ang opisina |
| SQD7 | I was treated courteously by the staff | Magalang akong trinato ng mga tauhan |
| SQD8 | I got what I needed from the government office | Nukuha ko ang kinakailangan ko mula sa tanggapan |

**Rating Scale:** 5 = Strongly Agree, 4 = Agree, 3 = Neither Agree nor Disagree, 2 = Disagree, 1 = Strongly Disagree, N/A = Not Applicable

### Footer
- **Suggestions:** Optional text area for improvement suggestions
- **Email Address:** Optional email for follow-up

## Business Rules
1. Only the ticket creator can submit a survey
2. Survey can only be submitted for resolved/closed tickets
3. Only one survey per ticket (enforced at submission)
4. Page 1 requires at least one service selected to proceed
5. Page 2 requires at least one SQD question answered to submit
6. CC2/CC3 are disabled if CC1 = 4 (not aware of CC)
7. Survey follows ARTA Client Satisfaction Measurement form (PSA Approval No.: ARTA-2331-3)

## UI Styling Notes
- The survey form uses custom CSS classes prefixed with `csm-` (Client Satisfaction Measurement)
- Includes CHMSU logo (`assets/chmsu-logo.png`)
- ARTA header bar with approval number
- University header with ICT Office name
- Responsive layout with fieldsets for each section
- Navigation buttons at the bottom

## Routes
- `/surveys` — Admin analytics page (protected, staff/admin only)
- Survey form is rendered inline in ticket detail modal (no dedicated route)

## Files Reference
| Component | Path |
|-----------|------|
| Survey Form (TS) | `frontend/src/app/features/tickets/survey/survey-form.component.ts` |
| Survey Form (HTML) | `frontend/src/app/features/tickets/survey/survey-form.component.html` |
| Survey Form (SCSS) | `frontend/src/app/features/tickets/survey/survey-form.component.scss` |
| Surveys Admin Page | `frontend/src/app/features/surveys/surveys.page.ts` |
| Ticket Detail Page | `frontend/src/app/features/tickets/ticket-detail.page.ts` |
| Ticket Service (Frontend) | `frontend/src/app/core/services/ticket.service.ts` |
| Ticket Service (Backend) | `backend/src/modules/tickets/services/ticket.service.ts` |
| Ticket Resolvers | `backend/src/modules/tickets/ticket.resolvers.ts` |
| Ticket Types (GraphQL) | `backend/src/modules/tickets/ticket.types.ts` |
| Prisma Schema | `backend/prisma/schema.prisma` |
| App Routes | `frontend/src/app/app.routes.ts` |
