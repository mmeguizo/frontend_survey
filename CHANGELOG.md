# CHANGELOG

## [Unreleased] - 2026-07-22

### Added

- **AI chat fallback resilience**
  - Added Hugging Face Inference API as a free-tier LLM fallback after Perplexity.
  - Added configurable per-provider timeout (`AI_REQUEST_TIMEOUT_MS`, default 45s) with Promise.race fallback logic.
  - `LlmClient.chatCompletion()` now returns `{ text, provider }` so callers know which model answered.
  - Chat responses expose `provider` via GraphQL so the UI can show a provider chip.
  - Created `docs/AI_TASKS.md` as a living registry of small, scoped AI improvement tasks.

### Changed

- AI chat now falls back through Gemini → Perplexity → Hugging Face → offline curated response instead of immediately returning a basic offline message.
- AI loading UX now shows "Switching to backup AI model…" after ~8 seconds when the primary provider is slow.
- Chat header subtitle and assistant replies now display the active AI provider (Gemini / Perplexity / Hugging Face / Offline).
- Updated `.github/agents/chmsu.agent.md` to reference `docs/AI_TASKS.md` for small-chunk agent work.

### Documentation

- Updated `docs/AI_INTEGRATION_POINTS.md` with the new provider fallback architecture.
- Updated `backend/.env.example` with AI provider and timeout variables.

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
