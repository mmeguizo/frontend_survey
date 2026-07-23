# AI Task Registry

This document is a living registry of small, scoped tasks for improving the AI features of the ICT Support System. Each entry is designed to be small enough that a free-tier agent or contributor can complete it in one session without timing out.

## How to use this registry

1. Pick **one** task at a time.
2. Move it to `In Progress` and update the `Updated` date.
3. When finished, mark it `Done` and add a short note in `Notes`.
4. If a task is too big, split it into smaller tasks before starting.

## Status legend

- `Pending` — not started
- `In Progress` — someone is working on it
- `Done` — completed and verified
- `Blocked` — cannot proceed (add reason in `Notes`)

---

## Tasks

### T1 — Robust AI fallback with free-tier LLM
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Medium  
**Files:** `backend/src/lib/llm-client.ts`, `backend/src/modules/chat/chat.service.ts`, `backend/src/modules/chat/chat.types.ts`, `backend/src/modules/chat/chat.resolvers.ts`, `frontend/src/app/core/services/chat.service.ts`, `frontend/src/app/shared/components/chat-widget.component.ts`  
**Description:** Add Hugging Face Inference API as a real LLM fallback after Perplexity. Wrap each provider call in a configurable timeout. Return the provider name to the frontend so the UI can show which model answered.  
**Acceptance criteria:**
- Gemini timeout falls back to Perplexity, then Hugging Face, then offline curated response.
- Frontend shows "Switching to backup AI model..." after ~8 seconds.
- Assistant reply shows a subtle provider chip.
- Backend and frontend TypeScript checks pass.

**Notes:** Implemented 2026-07-22. `AI_REQUEST_TIMEOUT_MS` default is 45s. Provider chip shows Gemini / Perplexity / Hugging Face / Offline.

### T2a — Streaming spike and approach decision
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `docs/AI_INTEGRATION_POINTS.md`, `backend/src/modules/chat/chat.service.ts` (notes only)  
**Description:** Compare three approaches: GraphQL subscription, Server-Sent Events (SSE), and simple chunked polling. Pick one and document the decision, data shape, and fallback plan. Do not write implementation code yet.  
**Acceptance criteria:**
- A short decision note is added under T2 in this file.
- Chosen approach can survive provider/stream failure and still fall back to non-streaming.
**Notes (T2a decision):** Approach chosen: **GraphQL Subscriptions**. Rationale: the project already has PubSub (`backend/src/lib/pubsub.ts`), WebSocket server (`backend/src/index.ts` line 371), and proven subscription patterns in the notifications module. No new dependencies needed. Data shape will be `ChatReplyChunk { sessionId, chunk, done, provider }`. Fallback plan: if the subscription errors mid-stream, the existing `sendChatMessage` mutation is called to get a complete response. The backend already supports `ChatMessage` metadata storage, so provider/chunk metadata flows naturally.

### T2b — Backend streaming schema and resolver stub
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/chat/chat.types.ts`, `backend/src/modules/chat/chat.resolvers.ts`, `backend/src/lib/pubsub.ts`  
**Description:** Add a `chatReplyStream(sessionId, message)` subscription (or equivalent endpoint) that returns a stream of partial reply chunks. Create the resolver stub that returns a static/mock async iterator.  
**Acceptance criteria:**
- GraphQL schema compiles.
- Subscription resolver returns mock chunks without calling the LLM yet.

### T2c — Backend chat service chunk emitter
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Medium  
**Files:** `backend/src/modules/chat/chat.service.ts`, `backend/src/lib/llm-client.ts`, `backend/src/modules/chat/chat.resolvers.ts`  
**Description:** Refactor `callGemini()` (or add a new method) so it can emit partial text chunks as they arrive from the LLM. For providers that do not stream, simulate chunks by splitting the final text every ~20 words.  
**Acceptance criteria:**
- `chat.service.ts` exposes a generator/async iterator that yields `{ chunk, done, provider? }`.
- Non-streaming providers still produce chunks.
- Fallback provider changes are emitted correctly.
**Notes:** `llm-client.ts` now has `streamChatCompletion()` async generator using Gemini `generateContentStream` natively, Perplexity SSE streaming, and Hugging Face with simulated 20-word chunks. `chat.service.ts` has `streamChatMessage()` async generator replicating the full RAG+checks flow. The `chatReplyStream` subscription resolver now delegates to real streaming with auth.

### T2d — Frontend streaming subscription and renderer
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Medium  
**Files:** `frontend/src/app/core/services/chat.service.ts`, `frontend/src/app/shared/components/chat-widget.component.ts`, `frontend/src/app/graphql/operations/chat.operations.graphql`  
**Description:** Wire the frontend to the streaming endpoint. Append chunks to a live assistant message as they arrive. Keep the existing non-streaming mutation as fallback.  
**Acceptance criteria:**
- First chunk renders within 5 seconds for long replies.
- Markdown is not re-rendered excessively (use a stable streaming message object).
- Existing send/receive flow still works if stream is disabled.
**Notes:** `chat.service.ts` has `streamMessage()` using `apollo.subscribe()`. `chat-widget.component.ts` try-es streaming first; on first chunk, shows live-rendered message with 80ms debounced markdown. On error, falls back to `sendMessage` mutation. Old `.graphql` subscription operation added. Cleanup via `ngOnDestroy`/`clearStreaming()` prevents leaks.

### T2e — Streaming error and fallback handling
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `frontend/src/app/shared/components/chat-widget.component.ts`  
**Description:** If the stream disconnects or errors mid-reply, fall back to the existing `sendChatMessage` mutation to get a complete response. Show the user a brief "Reconnecting…" indicator.  
**Acceptance criteria:**
- Stream error triggers a silent fallback to non-streaming mutation.
- User sees a final complete reply without duplicate messages.
- Fallback works even if the provider itself timed out.
**Notes:** Added `fallbackActive` signal for reconnecting state. When streaming errors, partial content stays visible with a "Reconnecting…" (spinning icon) indicator. On mutation success, the full reply replaces the partial content cleanly — no duplicate messages. On double failure, everything clears with an error toast. `clearStreaming()` also resets fallback.

### T3 — Local offline response templates
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/chat/chat.service.ts`
**Description:** Expand the curated fallback responses in `fallbackResponse()` with richer templates for common ICT issues (password reset, printer jam, Wi-Fi, projector borrowing).  
**Acceptance criteria:**
- At least 5 common issue templates exist.
- Templates still include a `ticket-data` block when appropriate.
**Notes:** Added 6 templates checked before existing ticket/context/generic branches: Password Reset, Printer Issue, Wi-Fi/Network, Projector/AV Booking, Software Install, Computer Issue. Each includes a `ticket-data` block for escalation. Backend TypeScript compiles clean.

### T4a — Chat health metrics schema and resolver stub
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/chat/chat.types.ts`, `backend/src/modules/chat/chat.resolvers.ts`  
**Description:** Define the `ChatHealthMetrics` GraphQL type (provider usage counts, fallback count, failure count, average response time, date range) and an admin-only `chatHealthMetrics(days: Int)` query. Return hardcoded zeros initially.  
**Acceptance criteria:**
- Schema compiles and resolver is ADMIN-only.
- Query returns zeros without errors.
**Notes:** Added `ChatHealthMetrics` + `ProviderUsageEntry` types and `chatHealthMetrics(days: Int! = 7)` query. Resolver stub returns zeros. Backend TypeScript compiles clean.

### T4b — Provider event logging in chat messages
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/chat/chat.service.ts`  
**Description:** Extend the assistant message metadata to always include `provider`, `durationMs`, and `fallback` flag. If provider is "Offline", mark `fallback: true`. Ensure this metadata is stored on every assistant reply.  
**Acceptance criteria:**
- Every new assistant message has metadata with `provider`, `durationMs`, and `fallback`.
- Existing messages without metadata are not migrated (accept null).
**Notes:** Added timing wrap (`startTime`/`durationMs`) around LLM calls in both `sendMessage()` and `streamChatMessage()`. Metadata now always includes `provider` (or null), `durationMs`, and `fallback` boolean (true when provider is "Offline"). Non-AI auto-replies (help/out-of-scope/deny) continue to store null metadata. Backend TypeScript compiles clean.

### T4c — Chat health metrics aggregation query
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/chat/chat.service.ts`, `backend/src/modules/chat/chat.resolvers.ts`  
**Description:** Implement the aggregation logic: read recent `ChatMessage` rows with `role = ASSISTANT` and `metadata`, group by provider, count fallbacks and failures, and compute average `durationMs`. Replace the hardcoded stub in T4a.  
**Acceptance criteria:**
- `chatHealthMetrics` returns real counts for the requested date range.
- Average response time is in milliseconds.
- Query is efficient (uses Prisma `where` on `createdAt` and `role`).
**Notes:** Added `ChatService.getHealthMetrics(days)` with Prisma query filtering by `role=ASSISTANT`, `createdAt >= fromDate`, `metadata != null`. Parses JSON metadata, groups by provider, counts fallbacks, computes average `durationMs`. Resolver now delegates to service. Backend TypeScript compiles clean.

### T4d — Admin UI health dashboard card
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `frontend/src/app/features/admin/admin.page.ts`, `frontend/src/app/api/admin-api.service.ts`, `frontend/src/app/features/admin/admin.page.html`, `frontend/src/app/features/admin/admin.page.scss`  
**Description:** Add a small "AI Chat Health" card or table to the admin page that calls `chatHealthMetrics`. Show provider usage, fallback rate, failure rate, and average response time.  
**Acceptance criteria:**
- Card loads when admin opens the page.
- Numbers match the backend query.
- Empty state is handled gracefully.
**Notes:** Added `ChatHealthMetrics` / `ProviderUsageEntry` interfaces and `chatHealthMetrics` GraphQL query to `admin-api.service.ts`. Admin page now shows a health card with 4 stat boxes (Total Messages, Fallbacks, Failures, Avg Response Time) and a provider breakdown table. Empty state shows "No AI chat data yet". Frontend TypeScript compiles clean.

### T5a — Central prompt version constants
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/ai/prompt-version.ts` (new), `backend/src/modules/chat/chat.service.ts`, `backend/src/modules/ai/gemini.service.ts`  
**Description:** Create a small constants file that exports `CHAT_PROMPT_VERSION` and `TICKET_ANALYSIS_PROMPT_VERSION`. Import and use these constants instead of inline strings.  
**Acceptance criteria:**
- New file exists and exports the two version constants.
- Chat system prompt and ticket analysis prompts reference the constants.
- TypeScript checks pass.
**Notes:** Created `prompt-version.ts` exporting `CHAT_PROMPT_VERSION = "1.0.0"` and `TICKET_ANALYSIS_PROMPT_VERSION = "1.0.0"`. Both prompts in `chat.service.ts` and `gemini.service.ts` now prepend `[Prompt v{VERSION}]` to their prompt strings. Backend TypeScript compiles clean.

### T5b — Add promptVersion to chat assistant metadata
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/chat/chat.service.ts`  
**Description:** Include `promptVersion` in the metadata stored with every assistant chat message.  
**Acceptance criteria:**
- Assistant chat message metadata contains `promptVersion` matching `CHAT_PROMPT_VERSION`.
- Existing messages without the field are unaffected.
**Notes:** Added `metadata.promptVersion = CHAT_PROMPT_VERSION` in both `sendMessage()` and `streamChatMessage()` metadata construction. Backend TypeScript compiles clean.

### T5c — Add promptVersion to ticket analysis metadata
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/ai/ai.resolvers.ts`, `backend/src/modules/ai/gemini.service.ts`  
**Description:** Return `promptVersion` from `analyzeTicket` and `smartSuggestions` resolvers. Update the GraphQL `TicketAIAnalysis` type to include the optional version field.  
**Acceptance criteria:**
- `TicketAIAnalysis` has an optional `promptVersion` field.
- `analyzeTicket` and `smartSuggestions` populate it from `TICKET_ANALYSIS_PROMPT_VERSION`.
- Frontend type generation still passes.
**Notes:** Added `promptVersion: String` to `TicketAIAnalysis` type, added `promptVersion` field to `TicketAnalysis` interface, and `mapAnalysis()` now populates it from `TICKET_ANALYSIS_PROMPT_VERSION`. Backend TypeScript compiles clean.

### T5d — Prompt version comparison query
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/chat/chat.resolvers.ts`, `backend/src/modules/chat/chat.service.ts`  
**Description:** Add an admin-only query that groups recent assistant chat replies by `promptVersion` and reports message count and average response time per version.  
**Acceptance criteria:**
- Query returns aggregated stats per prompt version.
- Useful for future A/B quality comparison.
**Notes:** Added `PromptVersionStats` type and `chatPromptVersionStats(days: Int! = 30)` query. Service method parses metadata JSON and groups by `promptVersion`. Admin-only resolver guard. Backend TypeScript compiles clean.

### T6 — Smaller, faster ticket analysis prompts
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/ai/gemini.service.ts`  
**Description:** Shrink the `SYSTEM_PROMPT` and `NLP_SYSTEM_PROMPT` to reduce token usage and speed up Gemini responses while keeping the same JSON output structure.  
**Acceptance criteria:**
- Prompts are at least 30% shorter.
- All existing AI analysis fields still parse correctly.
**Notes:** `SYSTEM_PROMPT` reduced ~62% (~1750→~670 chars). `NLP_SYSTEM_PROMPT` reduced ~35% (~1950→~1250 chars). All output field names and JSON structures preserved. Version header `[Prompt v1.0.0]` retained. Backend TypeScript compiles clean.

### T7 — Canned quick-reply quality review
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `frontend/src/app/shared/components/chat-widget.component.ts`  
**Description:** Review the quick prompts (internet, printer, software, account, ticket status) and add department-specific quick prompts for staff roles (e.g., "Show me overdue ITS tickets").  
**Acceptance criteria:**
- Staff quick prompts are department-aware.
- No duplicate or confusing prompts.
**Notes:** Added `roleToDepartment()` helper mapping roles to ITS/MIS/BOTH/GENERAL. `STAFF_QUICK_PROMPTS` replaced with `staffQuickPrompts(dept)` function. ITS staff see "Overdue ITS Tickets" + "Maintenance Queue" in addition to base staff prompts. MIS staff see "Pending MIS Requests" + "Account Requests". Admins/Devs get both sets. Frontend TypeScript compiles clean.

### T8a — Consecutive AI failure counter
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/lib/llm-client.ts`  
**Description:** Track consecutive provider failures in `LlmClient`. Reset the counter to zero on any successful response. Expose a read-only property or method so other services can check the current streak.  
**Acceptance criteria:**
- Counter increments when all providers fail for a request.
- Counter resets on success.
- No false positives from a single provider failure that is recovered by fallback.
**Notes:** Added `_consecutiveFailures` private field with public `consecutiveFailures` getter and `resetConsecutiveFailures()` method. Counter increments in `chatCompletion()` when all providers fail, and in `streamChatCompletion()` when all streaming + fallback fail. Counter resets to 0 on any successful response. Backend TypeScript compiles clean.

### T8b — Admin notification on AI provider failures
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/lib/llm-client.ts`, `backend/src/modules/chat/chat.service.ts`  
**Description:** When the consecutive failure counter reaches 3, create an in-app notification for every ADMIN user. Include the last failed provider name, error type, and timestamp. Throttle so admins do not get spammed (max one notification per hour).  
**Acceptance criteria:**
- Admins receive a notification after 3 consecutive failures.
- Notification body includes provider name and timestamp.
- Throttling prevents duplicate alerts within 1 hour.
**Notes:** Added `_lastError` tracking (`provider`, `message`, `timestamp`) to `LlmClient` updated on each failure. Added `ChatService.alertOnConsecutiveFailure()` — throttled (1h), checks `consecutiveFailures >= 3`, creates `STATUS_CHANGED` notification for all `Role.ADMIN` users with provider, error, and timestamp in metadata. Backend TypeScript compiles clean.

### T8c — Admin AI health alert banner
**Status:** Done  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `frontend/src/app/features/admin/admin.page.ts`  
**Description:** Add a small alert banner on the admin page when the latest `chatHealthMetrics` failure rate is high (e.g., >50% in the last hour). Link to the health metrics card from T4d.  
**Acceptance criteria:**
- Banner appears when failure rate exceeds threshold.
- Banner dismisses per session.
- Does not show for normal operation.
**Notes:** Added `showHealthAlert` signal with sessionStorage dismiss. After loading health metrics, shows orange banner if failure rate > 50%. Banner links to the health card (smooth scroll) and has a dismiss X button. Frontend TypeScript compiles clean.

---

## Adding a new task

Copy this template and append it to the table above:

```markdown
### Tx — Title
**Status:** Pending  
**Updated:** YYYY-MM-DD  
**Effort:** Small | Medium | Large  
**Files:** `path/to/file.ts`  
**Description:** One or two sentences describing the goal.  
**Acceptance criteria:**
- Criterion 1.
- Criterion 2.
```
