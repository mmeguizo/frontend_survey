# Client Satisfaction Measurement (CSM) Survey

## Overview

The Client Satisfaction Measurement Survey is an official ARTA (Anti-Red Tape Authority) form for tracking customer satisfaction with government office services. This replaces the previous basic star-rating system with a comprehensive 2-page form.

- **PSA Approval No.:** ARTA-2331-3
- **Form Type:** 2-page government survey (Demographics + CC Questions + SQD Ratings)
- **Database:** `ClientSatisfactionSurvey` model (MySQL via Prisma)
- **API:** GraphQL mutations and queries in the tickets module

---

## Database Model

### `ClientSatisfactionSurvey`

| Field               | Type                    | Description                                |
| ------------------- | ----------------------- | ------------------------------------------ |
| `id`                | Int (PK, autoincrement) | Unique survey ID                           |
| `ticketId`          | Int (unique, FK)        | Link to the resolved ticket                |
| `userId`            | Int (FK)                | User who submitted the survey              |
| `clientType`        | String?                 | CITIZEN, BUSINESS, or GOVERNMENT           |
| `date`              | String?                 | Survey date                                |
| `sex`               | String?                 | MALE or FEMALE                             |
| `age`               | Int?                    | Respondent age                             |
| `regionOfResidence` | String?                 | Region of residence                        |
| `serviceTalisay`    | Boolean                 | ICT Support - Talisay Campus               |
| `serviceExternal`   | Boolean                 | ICT Support - External Campus              |
| `cc1Awareness`      | Int?                    | CC awareness (1-4)                         |
| `cc2Visibility`     | Int?                    | CC visibility (1-5, N/A=5)                 |
| `cc3Helpfulness`    | Int?                    | CC helpfulness (1-4, N/A=4)                |
| `sqd0` - `sqd8`     | Int?                    | Service Quality Dimensions (1-5, null=N/A) |
| `suggestions`       | String?                 | Optional suggestions                       |
| `emailAddress`      | String?                 | Optional email                             |
| `createdAt`         | DateTime                | Auto-generated                             |
| `updatedAt`         | DateTime                | Auto-updated                               |

### Relationships

- **Ticket** `1:1` ClientSatisfactionSurvey (one survey per resolved ticket)
- **User** `1:N` ClientSatisfactionSurvey (one user can submit multiple surveys across tickets)

---

## GraphQL API

### Mutation: Submit Survey

```graphql
mutation SubmitClientSatisfactionSurvey(
  $ticketId: Int!
  $input: ClientSurveyInput!
) {
  submitClientSatisfactionSurvey(ticketId: $ticketId, input: $input) {
    id
    ticketId
    userId
    clientType
    sqd0
    sqd1
    # ... all fields
    createdAt
  }
}
```

**Permissions:** Ticket creator only, one-time per ticket, RESOLVED/CLOSED tickets only.

### Query: Survey Responses (Admin/Staff)

```graphql
query SurveyResponses($filter: AnalyticsFilterInput, $pagination: PaginationInput) {
  surveyResponses(filter: $filter, pagination: $pagination) {
    items { id, ticketId, user { name }, sqd0, sqd1, ... }
    totalCount
    page
    totalPages
  }
}
```

**Permissions:** ADMIN, DIRECTOR, SECRETARY, MIS_HEAD, ITS_HEAD, DEVELOPER, TECHNICAL.

### Query: Survey Analytics (Admin/Staff)

```graphql
query SurveyAnalytics($filter: AnalyticsFilterInput) {
  surveyAnalytics(filter: $filter) {
    totalSurveys
    averageSqdScores {
      dimension
      average
      count
    }
    ccAwarenessDistribution {
      code
      label
      count
    }
    clientTypeDistribution {
      key
      count
    }
    satisfactionOverTime {
      date
      averageSqdScore
      count
    }
  }
}
```

---

## Citizen's Charter (CC) Questions

### CC1 - Awareness

1. I know what a CC is and I saw this office's CC.
2. I know what a CC is but I did NOT see this office's CC.
3. I learned of the CC only when I saw this office's CC.
4. I do not know what a CC is and I did not see one in this office.
   - _(If selected, CC2 and CC3 are N/A)_

### CC2 - Visibility (only if CC1 = 1-3)

1. Easy to see
2. Somewhat easy to see
3. Difficult to see
4. Not visible at all
5. N/A

### CC3 - Helpfulness (only if CC1 = 1-3)

1. Helped very much
2. Somewhat helped
3. Did not help
4. N/A

---

## Service Quality Dimensions (SQD0-SQD8)

Each dimension rated 1-5 (Strongly Disagree to Strongly Agree) or N/A:

| Code | English                                        | Tagalog                               |
| ---- | ---------------------------------------------- | ------------------------------------- |
| SQD0 | I am satisfied with the service that I availed | Nasiyahan ako sa serbisyo...          |
| SQD1 | I spent a reasonable amount of time            | Makatwiran ang oras...                |
| SQD2 | Office followed requirements and steps         | Ang opisina ay sumusunod...           |
| SQD3 | Steps were easy and simple                     | Ang mga hakbang...ay madali           |
| SQD4 | Easily found information                       | Mabilis at madali akong nakahanap...  |
| SQD5 | Paid reasonable fees                           | Nagbayad ako ng makatwirang halaga... |
| SQD6 | Office was fair to everyone                    | Pakiramdam ko ay patas ang opisina... |
| SQD7 | Treated courteously by staff                   | Magalang akong trinato...             |
| SQD8 | Got what I needed                              | Nakuha ko ang kinakailangan ko...     |

---

## Frontend Integration

**Component:** `SurveyFormComponent` (`frontend/src/app/features/tickets/survey/`)

- Two-page wizard with ARTA header, CHMSU branding
- Responsive design matching government form layout
- Validation: CC2/CC3 disabled when CC1 = 4
- Displayed on ticket detail page when ticket is resolved/closed
- User can view but not edit after submission

---

## Legacy Star Rating

The old `satisfactionRating` (1-5 stars) and `satisfactionComment` fields on `Ticket` are **kept for backward compatibility** with existing data. New surveys use the `ClientSatisfactionSurvey` table exclusively.

---

## Migration

```bash
npx prisma migrate dev --name add_client_satisfaction_survey
```
