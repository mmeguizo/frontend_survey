# CHANGELOG

## [Unreleased] - 2026-06-10

### Added

- **Client Satisfaction Measurement (CSM) Survey** — Official ARTA form (PSA Approval No.: ARTA-2331-3)
  - New `ClientSatisfactionSurvey` database model with 30+ fields
  - GraphQL mutation: `submitClientSatisfactionSurvey` (ticket creator only, one-time per ticket)
  - GraphQL queries: `surveyResponses` (paginated), `surveyAnalytics` (aggregated stats)
  - Responsive 2-page survey form component with ARTA header and CHMSU branding
  - Citizen's Charter awareness (CC1-CC3) and Service Quality Dimensions (SQD0-SQD8)
  - Admin analytics backend support (future UI TBD)

### Changed

- Replaced star-based satisfaction rating UI on ticket detail page with the new CSM survey form
- Legacy `satisfactionRating` and `satisfactionComment` fields on `Ticket` retained for backward compatibility

### Documentation

- Added `backend/docs/CLIENT_SATISFACTION_SURVEY.md` — full API and schema reference
- Updated `backend/ARCHITECTURE.md` — marked CSM survey module as complete

### Migration

- Prisma migration: `add_client_satisfaction_survey`
