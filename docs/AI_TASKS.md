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

### T2 — Streaming or chunked chat responses
**Status:** Pending  
**Updated:** 2026-07-22  
**Effort:** Large  
**Files:** backend GraphQL subscriptions, `backend/src/modules/chat/chat.service.ts`, `frontend/src/app/shared/components/chat-widget.component.ts`  
**Description:** Investigate streaming/chunking the assistant reply so long responses do not have to wait for the full generation. Start with a simple "typing" chunk every few seconds or a GraphQL subscription for the reply.  
**Acceptance criteria:**
- Long replies start appearing within 5 seconds.
- Fallback still works if the stream fails.

### T3 — Local offline response templates
**Status:** Pending  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/chat/chat.service.ts`  
**Description:** Expand the curated fallback responses in `fallbackResponse()` with richer templates for common ICT issues (password reset, printer jam, Wi-Fi, projector borrowing).  
**Acceptance criteria:**
- At least 5 common issue templates exist.
- Templates still include a `ticket-data` block when appropriate.

### T4 — Chat analytics and health dashboard
**Status:** Pending  
**Updated:** 2026-07-22  
**Effort:** Medium  
**Files:** `backend/src/modules/chat/chat.resolvers.ts`, admin page  
**Description:** Add a simple admin-only query that returns AI chat health metrics: provider usage counts, fallback rate, average response time, and failure rate over the last 7 days.  
**Acceptance criteria:**
- New GraphQL query `chatHealthMetrics` returns counts.
- Admin UI shows a small card or table with the metrics.

### T5 — Prompt versioning and A/B tracking
**Status:** Pending  
**Updated:** 2026-07-22  
**Effort:** Medium  
**Files:** `backend/src/modules/chat/chat.service.ts`, `backend/src/modules/ai/gemini.service.ts`  
**Description:** Store the system prompt version in a constant and add it to chat message metadata. This lets us compare reply quality across prompt versions later.  
**Acceptance criteria:**
- Each assistant reply metadata includes `promptVersion`.
- Version is a single constant shared by chat and ticket analysis.

### T6 — Smaller, faster ticket analysis prompts
**Status:** Pending  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `backend/src/modules/ai/gemini.service.ts`  
**Description:** Shrink the `SYSTEM_PROMPT` and `NLP_SYSTEM_PROMPT` to reduce token usage and speed up Gemini responses while keeping the same JSON output structure.  
**Acceptance criteria:**
- Prompts are at least 30% shorter.
- All existing AI analysis fields still parse correctly.

### T7 — Canned quick-reply quality review
**Status:** Pending  
**Updated:** 2026-07-22  
**Effort:** Small  
**Files:** `frontend/src/app/shared/components/chat-widget.component.ts`  
**Description:** Review the quick prompts (internet, printer, software, account, ticket status) and add department-specific quick prompts for staff roles (e.g., "Show me overdue ITS tickets").  
**Acceptance criteria:**
- Staff quick prompts are department-aware.
- No duplicate or confusing prompts.

### T8 — AI provider quota and error alerting
**Status:** Pending  
**Updated:** 2026-07-22  
**Effort:** Medium  
**Files:** `backend/src/lib/llm-client.ts`, notification service  
**Description:** When all AI providers fail or quota is exhausted, log a notification for admins. Include provider name, error type, and timestamp.  
**Acceptance criteria:**
- Admins receive an in-app notification after 3 consecutive provider failures.
- Notification includes which provider failed last.

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
