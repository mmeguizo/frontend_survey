# CHANGELOG

## [2.8.0] - 2026-07-22

### Added

- **AI chat fallback resilience**
  - Added Hugging Face Inference API as a free-tier LLM fallback after Perplexity
  - Configurable per-provider timeout (`AI_REQUEST_TIMEOUT_MS`, default 45s) with Promise.race fallback logic
  - `LlmClient.chatCompletion()` now returns `{ text, provider }` so callers know which model answered
  - Chat responses expose `provider` via GraphQL for UI provider chip display

- **AI chat streaming** (GraphQL Subscriptions)
  - `chatReplyStream` subscription for real-time partial response display
  - Gemini native streaming via `generateContentStream`
  - Perplexity SSE streaming fallback
  - Hugging Face simulated chunk streaming (20-word splits)
  - Frontend `streamMessage()` with 80ms debounced markdown rendering
  - "Reconnecting…" indicator on stream failure with fallback to mutation
  - `fallbackActive` signal for reconnecting state

- **6 offline fallback templates** for common ICT issues
  - Password Reset, Printer Issue, Wi-Fi/Network, Projector/AV Booking, Software Install, Computer Issue
  - Each includes a `ticket-data` block for escalation

- **Chat health metrics dashboard** (admin-only)
  - `ChatHealthMetrics` + `ProviderUsageEntry` GraphQL types
  - `chatHealthMetrics(days)` query with real Prisma aggregation
  - Admin UI card with stat boxes (messages, fallbacks, failures, avg response time) and provider breakdown table

- **Provider event logging**
  - `durationMs`, `fallback` flag, and `provider` captured in every AI assistant message metadata
  - Enables per-provider performance tracking

- **Prompt versioning**
  - New `backend/src/modules/ai/prompt-version.ts` — `CHAT_PROMPT_VERSION` and `TICKET_ANALYSIS_PROMPT_VERSION`
  - `promptVersion` stored in chat metadata and `TicketAIAnalysis` GraphQL type
  - `chatPromptVersionStats(days)` admin query for version comparison

- **Provider failure alerting**
  - Consecutive failure counter in `LlmClient` with public getter
  - Admin in-app notifications at 3 consecutive failures (1-hour throttle)
  - Admin page alert banner when failure rate > 50% (dismissable per session)

- **Department-aware quick prompts**
  - ITS staff: "Overdue ITS Tickets" + "Maintenance Queue"
  - MIS staff: "Pending MIS Requests" + "Account Requests"
  - Admins/Devs get both sets
  - `roleToDepartment()` helper for role→department mapping

### Changed

- AI chat now falls back through Gemini → Perplexity → Hugging Face → offline curated response instead of immediately returning a basic offline message
- AI loading UX now shows "Switching to backup AI model…" after ~8 seconds when the primary provider is slow
- Chat header subtitle and assistant replies now display the active AI provider (Gemini / Perplexity / Hugging Face / Offline)
- Updated `.github/agents/chmsu.agent.md` to reference `docs/AI_TASKS.md` for small-chunk agent work

- **Ticket analysis prompts** reduced by 35–62% for faster responses
  - `SYSTEM_PROMPT`: ~1750 → ~670 chars (62% reduction)
  - `NLP_SYSTEM_PROMPT`: ~1950 → ~1250 chars (35% reduction)
- AI chat now streams responses by default, with non-streaming mutation fallback
- Chat messages now include `durationMs`, `fallback`, and `promptVersion` in metadata
- `LlmClient.chatCompletion()` and `streamChatCompletion()` track `_lastError` with provider, message, and timestamp

### Documentation

- Updated `docs/AI_INTEGRATION_POINTS.md` with the new provider fallback architecture
- Updated `backend/.env.example` with AI provider and timeout variables
- Created `docs/AI_TASKS.md` as a living registry of small, scoped AI improvement tasks
- Updated `docs/AI_TASKS.md` — all tasks T1 through T8c completed
- Created `docs/superpowers/specs/2026-07-22-t3-offline-templates-design.md`
- Created `docs/superpowers/plans/2026-07-22-t3-offline-templates.md`

## [2.7.2] - 2026-06-10

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
