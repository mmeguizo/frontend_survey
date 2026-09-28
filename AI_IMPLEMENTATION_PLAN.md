# AI Provider Refactoring & Response Logic Implementation Plan

> **Purpose**: This document is a self-contained instruction set for any AI assistant to pick up and execute. It describes the CURRENT state of the codebase, the DESIRED changes, and the EXACT files + line ranges to modify.

> **Project Root**: `C:\Users\markm\Desktop\ai ict\ictsystem`  
> **Stack**: Angular 20 frontend + Node.js/Express/Apollo Server backend + Prisma ORM (MySQL)  
> **Last Updated**: 2026-09-28

---

## Table of Contents

1. [Goal Summary](#1-goal-summary)
2. [Current Architecture](#2-current-architecture)
3. [Desired Architecture](#3-desired-architecture)
4. [Decision Flow Diagram](#4-decision-flow-diagram)
5. [Task 1: Remove Perplexity Provider](#task-1-remove-perplexity-provider)
6. [Task 2: Enforce AI Provider Chain (Gemini → HuggingFace → Offline Generic)](#task-2-enforce-ai-provider-chain)
7. [Task 3: Implement "Solved Tickets First" Response Logic](#task-3-implement-solved-tickets-first-response-logic)
8. [Task 4: General vs University-Specific Issue Routing](#task-4-general-vs-university-specific-issue-routing)
9. [Task 5: Frontend Cleanup](#task-5-frontend-cleanup)
10. [Task 6: Environment & Config Cleanup](#task-6-environment--config-cleanup)
11. [Testing Checklist](#testing-checklist)
12. [File Reference Table](#file-reference-table)

---

## 1. Goal Summary

| # | Goal | Status |
|---|------|--------|
| 1 | **Remove Perplexity** as a backup AI provider entirely | 🔲 TODO |
| 2 | **Gemini** is the ONLY primary AI provider | 🔲 TODO |
| 3 | **HuggingFace** is the ONLY fallback if Gemini fails | 🔲 TODO |
| 4 | If ALL providers fail → return a **generic offline response** (already mostly done) | 🔲 VERIFY |
| 5 | AI must check **solved tickets & troubleshooting solutions FIRST** before going to the internet | 🔲 TODO |
| 6 | For **general/common problems** (wifi, forgot password, printer) → provide generic troubleshooting steps (already has offline templates) | 🔲 VERIFY |
| 7 | For **university-specific/internal issues** (portal, enrollment system, university-unique processes) → if no solved ticket match, **create a ticket immediately** instead of searching the internet | 🔲 TODO |

---

## 2. Current Architecture

### AI Provider Priority Chain (CURRENT)
```
1. Google Gemini (primary)         — via @google/generative-ai SDK
2. Hugging Face (fallback)         — via HTTP POST to inference API
3. Offline fallback templates      — hardcoded rule-based responses
```

### Perplexity Status (CURRENT)
Perplexity is **configured but NOT actively used** in the provider chain. It exists as dead/vestigial code:
- Config exists in `backend/src/config/index.ts` (lines 39-42)
- `isPerplexityAvailable()` method exists in `backend/src/lib/llm-client.ts` (lines 84-86)
- Referenced in `GeminiService.isAvailable()` at `backend/src/modules/ai/gemini.service.ts` (line 109)
- `.env` has `PERPLEXITY_API_KEY` set
- `.env.example` has `PERPLEXITY_API_KEY=""` placeholder
- Error messages mention `PERPLEXITY_API_KEY` in logs

### Current Response Flow (CURRENT)
```
User sends message
  → Check /help command
  → Check out-of-scope (non-ICT topics)
  → Check ticket status query
  → Check analytics/reports (role-gated)
  → RAG Context Retrieval (KB articles + resolved tickets + solutions)
  → IF all RAG sources empty → Web Search Mode (Google Search Grounding via Gemini)
  → IF Gemini fails → HuggingFace fallback
  → IF all fail → Offline rule-based templates
```

**Problem with current flow**: When RAG returns no results, it jumps straight to internet search. It does NOT distinguish between:
- General problems (where internet search is OK)
- University-specific problems (where a ticket should be created instead)

---

## 3. Desired Architecture

### AI Provider Priority Chain (DESIRED)
```
1. Google Gemini (primary)         — ONLY primary provider
2. Hugging Face (fallback)         — ONLY backup if Gemini fails  
3. Generic offline response        — if ALL providers fail
```
**NO Perplexity at all.**

### Desired Response Flow (NEW)
```
User sends message
  → Check /help command
  → Check out-of-scope (non-ICT topics)
  → Check ticket status query  
  → Check analytics/reports (role-gated)
  → RAG Context Retrieval (KB articles + resolved tickets + troubleshooting solutions)
  → IF RAG has results → Use them as context for Gemini response (EXISTING BEHAVIOR ✅)
  → IF RAG has NO results:
      → Classify the issue: Is it GENERAL or UNIVERSITY-SPECIFIC?
        → IF GENERAL (wifi, password reset, printer, slow PC, etc.)
            → Provide generic troubleshooting steps (can use web search as supplement)
        → IF UNIVERSITY-SPECIFIC (portal, enrollment, SIS, university systems, etc.)
            → DO NOT search the internet
            → Immediately guide user to create a ticket
            → Output ```ticket-data``` block right away
```

---

## 4. Decision Flow Diagram

```
┌─────────────────────────┐
│   User Sends Message    │
└───────────┬─────────────┘
            │
      ┌─────▼──────┐
      │  /help ?    │──Yes──▶ Return help text
      └─────┬──────┘
            │ No
      ┌─────▼──────────┐
      │  Out of scope? │──Yes──▶ Redirect to ICT topics
      └─────┬──────────┘
            │ No
      ┌─────▼──────────────┐
      │  Ticket status?    │──Yes──▶ Return ticket info
      └─────┬──────────────┘
            │ No
      ┌─────▼──────────────┐
      │  RAG Retrieval     │
      │  (KB + Tickets +   │
      │   Solutions)       │
      └─────┬──────────────┘
            │
      ┌─────▼──────────────────────┐
      │  RAG has relevant results? │
      └─────┬────────────┬────────┘
            │ Yes        │ No
      ┌─────▼─────┐  ┌──▼──────────────────┐
      │ Use RAG   │  │ Classify the issue   │
      │ context   │  │ GENERAL vs           │
      │ + Gemini  │  │ UNIVERSITY-SPECIFIC  │
      └───────────┘  └──┬───────────┬───────┘
                        │           │
                  GENERAL      UNIVERSITY-SPECIFIC
                        │           │
              ┌─────────▼─┐    ┌────▼──────────────┐
              │ Provide    │    │ Skip web search    │
              │ generic    │    │ Tell user this is  │
              │ steps      │    │ unique to CHMSU    │
              │ (can use   │    │ → Create ticket    │
              │ web search)│    │ immediately        │
              └────────────┘    └────────────────────┘
```

---

## Task 1: Remove Perplexity Provider

### Files to Modify

#### 1A. `backend/src/config/index.ts` (lines 39-42)
**Action**: DELETE the perplexity config block.

```typescript
// DELETE THESE LINES (39-42):
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || "",
    model: process.env.PERPLEXITY_MODEL || "sonar",
  },
```

#### 1B. `backend/src/lib/llm-client.ts`
**Action**: Remove `isPerplexityAvailable()` method and all Perplexity references.

- **DELETE lines 84-86**: The `isPerplexityAvailable()` method
  ```typescript
  // DELETE:
  isPerplexityAvailable(): boolean {
    return Boolean(config.perplexity.apiKey);
  }
  ```

- **EDIT line 102**: Remove `PERPLEXITY_API_KEY` from the warning message
  ```typescript
  // CHANGE FROM:
  "[LlmClient] No LLM provider configured! Set GEMINI_API_KEY, PERPLEXITY_API_KEY, or HF_TOKEN in .env"
  // CHANGE TO:
  "[LlmClient] No LLM provider configured! Set GEMINI_API_KEY or HF_TOKEN in .env"
  ```

#### 1C. `backend/src/modules/ai/gemini.service.ts` (line 109)
**Action**: Remove Perplexity from the availability check.

```typescript
// CHANGE FROM:
isAvailable(): boolean {
  return llmClient.isPerplexityAvailable() || llmClient.isGeminiAvailable();
}

// CHANGE TO:
isAvailable(): boolean {
  return llmClient.isGeminiAvailable() || llmClient.isHuggingFaceAvailable();
}
```

#### 1D. `backend/src/modules/ai/ai.resolvers.ts` (line 57)
**Action**: Remove `PERPLEXITY_API_KEY` from the error message.

```typescript
// CHANGE FROM:
"AI analysis is not available — no LLM provider is configured. Set GEMINI_API_KEY, PERPLEXITY_API_KEY, or HF_TOKEN in .env"

// CHANGE TO:
"AI analysis is not available — no LLM provider is configured. Set GEMINI_API_KEY or HF_TOKEN in .env"
```

#### 1E. `backend/.env` (line 25)
**Action**: DELETE the Perplexity API key line.

```
# DELETE:
PERPLEXITY_API_KEY="pplx-REDACTED"
```

#### 1F. `backend/.env.example` (line 16)
**Action**: DELETE the Perplexity placeholder line.

```
# DELETE:
PERPLEXITY_API_KEY=""
```

> [!CAUTION]
> After removing Perplexity references, search the entire codebase with:
> `findstr /s /i /r "perplexity" backend\src\*.ts backend\.env*`
> to make sure nothing is missed.

---

## Task 2: Enforce AI Provider Chain

### Current State
The provider chain in `llm-client.ts` already follows `Gemini → HuggingFace → throw`. This is CORRECT.

### What to Verify
The `chatCompletion()` method at lines 117-175 and `streamChatCompletion()` at lines 188-232 already implement:
1. Try Gemini first
2. Fall back to HuggingFace
3. If both fail, throw error (caught by `chat.service.ts` which returns `fallbackResponse`)

**No code changes needed here** — just verify after Perplexity removal that the chain still works.

### Offline Generic Response
The `fallbackResponse()` method in `chat.service.ts` (starting line 2616) already provides curated offline responses for:
- ✅ Password/account issues
- ✅ Printer/paper jam
- ✅ Wi-Fi/network connectivity
- ✅ AV equipment/projector borrowing
- ✅ Software installation
- ✅ Computer slow/freeze/crash
- ✅ Generic ticket creation intent

**No changes needed** — these templates are the "generic response" safety net.

---

## Task 3: Implement "Solved Tickets First" Response Logic

### Current State (Already Correct ✅)
The RAG retrieval in `chat.service.ts` (`retrieveContext()` at line 818) already searches in this priority:
1. Knowledge Base articles (fulltext MySQL search)
2. Resolved tickets with resolutions (fulltext MySQL search)
3. Troubleshooting Solutions (fulltext search)
4. Troubleshooting Solutions (vector/embedding cosine similarity)

The system prompt (`CHAT_SYSTEM_PROMPT` starting line 22) already enforces priority:
```
KNOWLEDGE PRIORITY:
1. Knowledge Base articles (highest — curated solutions)
2. Troubleshooting Solutions from resolved tickets (proven fixes)
3. Resolved ticket history (past similar issues)
4. General ICT knowledge (last resort)
```

### What to Reinforce
The `webSearchNeeded()` method at line 2479 currently triggers web search whenever ALL RAG sources return empty. **This needs to be modified** to check issue classification BEFORE going to web search (see Task 4).

---

## Task 4: General vs University-Specific Issue Routing

### This is the KEY new logic to implement.

### 4A. Define University-Specific Patterns

Add a new constant in `backend/src/modules/chat/chat.service.ts` (after the existing `OUT_OF_SCOPE_PATTERNS` around line 204):

```typescript
/**
 * Patterns that indicate a UNIVERSITY-SPECIFIC issue.
 * These are problems unique to CHMSU's internal systems and processes.
 * When no solved ticket/KB match is found for these, we should create
 * a ticket immediately instead of searching the internet.
 */
const UNIVERSITY_SPECIFIC_PATTERNS = [
  // University portal & systems
  /\b(portal|student\s*portal|faculty\s*portal|enrollment\s*system|sis|student\s*information)/i,
  /\b(lms|learning\s*management|moodle|e-?learning|online\s*class\s*platform)/i,
  /\b(grading\s*system|grade\s*submission|grade\s*encoding|cor|certificate\s*of\s*registration)/i,
  /\b(library\s*system|opac|online\s*catalog)/i,
  /\b(biometrics|dtr|daily\s*time\s*record|attendance\s*system)/i,
  /\b(payroll\s*system|hris|human\s*resource)/i,
  // University-specific processes
  /\b(chmsu|university\s*(system|portal|website|server|network))/i,
  /\b(id\s*validation|school\s*id\s*system|rfid)/i,
  /\b(document\s*tracking|dts|records\s*management)/i,
  /\b(admission\s*system|online\s*admission|entrance\s*exam\s*system)/i,
  /\b(clearance\s*system|online\s*clearance)/i,
  /\b(e-?services|cashier\s*system|assessment\s*system)/i,
  // Internal network/server issues specific to campus
  /\b(campus\s*network|server\s*room|data\s*center|campus\s*wi-?fi)/i,
  /\b(mis\s*office|its\s*office|ict\s*office)/i,
];

/**
 * Patterns that indicate a GENERAL/COMMON ICT problem.
 * These are universal IT issues where generic troubleshooting or
 * internet-sourced solutions are appropriate.
 */
const GENERAL_ICT_PATTERNS = [
  /\b(wi-?fi|wifi|internet|no\s*connection|can'?t\s*connect|network|ethernet)/i,
  /\b(password|forgot\s*password|reset\s*password|can'?t\s*log\s*in|locked\s*out)/i,
  /\b(printer|print|paper\s*jam|toner|ink|scanner)/i,
  /\b(slow\s*(computer|pc|laptop)|freeze|crash|blue\s*screen|bsod|restart)/i,
  /\b(email|outlook|gmail|mail\s*setup|smtp|imap)/i,
  /\b(browser|chrome|firefox|edge|can'?t\s*open\s*website)/i,
  /\b(usb|flash\s*drive|external\s*drive|storage)/i,
  /\b(monitor|display|screen|resolution|hdmi|vga)/i,
  /\b(keyboard|mouse|trackpad|touchpad)/i,
  /\b(antivirus|malware|virus|security\s*scan)/i,
  /\b(update|windows\s*update|software\s*update|driver)/i,
  /\b(backup|restore|data\s*recovery)/i,
  /\b(vpn|remote\s*access|remote\s*desktop)/i,
];
```

### 4B. Add Classification Method

Add a new private method in `ChatService` class:

```typescript
/**
 * Classify whether an issue is general (common IT) or university-specific.
 * Returns: 'general' | 'university-specific' | 'unknown'
 */
private classifyIssueType(message: string): 'general' | 'university-specific' | 'unknown' {
  const isUniversitySpecific = UNIVERSITY_SPECIFIC_PATTERNS.some(p => p.test(message));
  const isGeneral = GENERAL_ICT_PATTERNS.some(p => p.test(message));

  // If it matches university-specific patterns, prioritize that
  if (isUniversitySpecific && !isGeneral) return 'university-specific';
  // If it matches both, lean toward university-specific (safer to create ticket)
  if (isUniversitySpecific && isGeneral) return 'university-specific';
  // If it matches general patterns only
  if (isGeneral) return 'general';
  // If we can't tell, default to university-specific (safer — creates ticket)
  return 'unknown';
}
```

### 4C. Modify the Response Flow in `sendMessage()` and `streamChatMessage()`

**In `sendMessage()` (around lines 443-541)**, replace the web search decision logic:

```typescript
// CURRENT CODE (around line 444):
const useWebSearch = this.webSearchNeeded(ragContext) && !ticketContext && !analyticsContext && !reportContext;

// REPLACE WITH:
let useWebSearch = false;
let forceTicketCreation = false;

if (this.webSearchNeeded(ragContext) && !ticketContext && !analyticsContext && !reportContext) {
  const issueType = this.classifyIssueType(userMessage);

  if (issueType === 'university-specific' || issueType === 'unknown') {
    // University-specific issue with no internal solution found → skip web search, create ticket
    forceTicketCreation = true;
    logger.info(`[ChatService] University-specific issue with no RAG results — will prompt ticket creation for: "${userMessage.substring(0, 80)}"`);
  } else {
    // General IT issue → web search is OK
    useWebSearch = true;
  }
}
```

**Then, after the context string building (around line 506-513)**, add the ticket creation context:

```typescript
// ADD THIS after the existing web search mode context block:
if (forceTicketCreation) {
  contextStr +=
    "\n--- TICKET CREATION MODE ---\n" +
    "No internal knowledge base articles, resolved tickets, or troubleshooting solutions matched this query.\n" +
    "This appears to be a university-specific issue that our AI does not have documented steps for.\n" +
    "DO NOT search the internet for a solution. Instead:\n" +
    "1. Acknowledge the user's issue with empathy.\n" +
    "2. Explain that this requires hands-on support from the ICT team because it involves a CHMSU-specific system or process.\n" +
    "3. Immediately output a ```ticket-data``` JSON block so a support ticket can be created.\n" +
    "4. Set priority based on the user's urgency. Default to MEDIUM if unclear.\n";
  logger.info(`[ChatService] No internal RAG results for university-specific query — forcing ticket creation for: "${userMessage.substring(0, 80)}"`);
}
```

**Same changes must be applied to `streamChatMessage()`** (the streaming version, around lines 654-706). The logic is duplicated there.

### 4D. Update the `callGemini` and `callGeminiWithWebSearch` selection logic

In `sendMessage()` around lines 522-541, update to handle the three modes:

```typescript
// CURRENT:
if (useWebSearch) {
  const result = await this.callGeminiWithWebSearch(...);
  ...
} else {
  const result = await this.callGemini(...);
  ...
}

// REPLACE WITH:
if (useWebSearch) {
  // General issue, no RAG results → use web search
  const result = await this.callGeminiWithWebSearch(
    session.messages, userMessage, contextStr,
  );
  reply = result.reply;
  provider = result.provider;
  webSearchUsed = result.webSearchUsed;
} else {
  // Either RAG has results, or it's a university-specific issue (forceTicketCreation).
  // In both cases, use standard Gemini with the context (which includes ticket creation instructions).
  const result = await this.callGemini(
    session.messages, userMessage, contextStr,
  );
  reply = result.reply;
  provider = result.provider;
}
```

**Same changes in `streamChatMessage()`** (around lines 736-746).

---

## Task 5: Frontend Cleanup

### 5A. No Perplexity references exist in the frontend ✅
Verified: `findstr /s /i "perplexity" frontend\src\*.ts` returned no results.

### 5B. Verify Provider Chip Display
In `frontend/src/app/shared/components/chat-widget.component.ts`, the provider chips already handle:
- `"Offline"` → Offline mode chip
- `"Gemini (Web)"` → Web Search chip + warning banner
- Other values → Standard chip ("Answered by Gemini" / "Answered by Hugging Face")

No changes needed — just verify the new `forceTicketCreation` flow still shows appropriate chips.

---

## Task 6: Environment & Config Cleanup

### 6A. `backend/.env`
Remove:
```
PERPLEXITY_API_KEY="pplx-..."
PERPLEXITY_MODEL=...  (if exists)
```

Ensure these exist:
```
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.5-flash"
HF_TOKEN="..."
HF_MODEL="Qwen/Qwen2.5-72B-Instruct"
AI_REQUEST_TIMEOUT_MS=45000
```

### 6B. `backend/.env.example`
Remove:
```
PERPLEXITY_API_KEY=""
PERPLEXITY_MODEL=""
```

Keep:
```
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
HF_TOKEN=""
HF_MODEL="Qwen/Qwen2.5-72B-Instruct"
AI_REQUEST_TIMEOUT_MS=45000
```

---

## Testing Checklist

After implementing all changes, verify:

- [ ] **Perplexity fully removed**: `findstr /s /i "perplexity" backend\src\*.ts backend\.env*` returns 0 results
- [ ] **Server starts without errors**: `cd backend && npm run dev`
- [ ] **Chat works with Gemini**: Send a message → response comes from Gemini
- [ ] **HuggingFace fallback works**: Temporarily set `GEMINI_API_KEY=""` → should fall back to HuggingFace
- [ ] **Offline fallback works**: Set both `GEMINI_API_KEY=""` and `HF_TOKEN=""` → should return offline templates
- [ ] **Solved tickets priority**: Create a resolved ticket for "wifi issue", then ask about wifi → AI should reference the solved ticket
- [ ] **General issue + no RAG → web search**: Ask about something general (e.g., "how to fix DNS error") with no matching KB/tickets → should trigger web search mode
- [ ] **University-specific + no RAG → ticket creation**: Ask "portal enrollment not loading" with no matching KB/tickets → should immediately offer ticket creation WITHOUT web search
- [ ] **University-specific + RAG match → use RAG**: Ask "portal enrollment not loading" WITH a matching solved ticket → should use the solved ticket as context (normal RAG flow)
- [ ] **Frontend provider chips**: Verify correct chips show for each provider
- [ ] **Ticket creation from chat**: Verify `ticket-data` blocks still render the "Create Support Ticket" button

---

## File Reference Table

| File | What to Change | Task |
|------|---------------|------|
| `backend/src/config/index.ts` | Delete `perplexity` config block (lines 39-42) | Task 1A |
| `backend/src/lib/llm-client.ts` | Delete `isPerplexityAvailable()`, update log messages | Task 1B |
| `backend/src/modules/ai/gemini.service.ts` | Fix `isAvailable()` to remove Perplexity (line 109) | Task 1C |
| `backend/src/modules/ai/ai.resolvers.ts` | Remove Perplexity from error message (line 57) | Task 1D |
| `backend/.env` | Delete `PERPLEXITY_API_KEY` line | Task 1E |
| `backend/.env.example` | Delete `PERPLEXITY_API_KEY` line | Task 1F |
| `backend/src/modules/chat/chat.service.ts` | Add `UNIVERSITY_SPECIFIC_PATTERNS`, `GENERAL_ICT_PATTERNS`, `classifyIssueType()`, modify `sendMessage()` and `streamChatMessage()` web search logic | Tasks 3, 4 |
| `frontend/src/app/shared/components/chat-widget.component.ts` | No changes needed — verify only | Task 5 |

---

## Quick Start for the Next AI

1. Read this entire document first.
2. Execute Tasks 1A through 1F (Perplexity removal) — these are simple deletions.
3. Execute Task 4A-4D (the main logic change) — add pattern constants and modify the decision flow.
4. Run through the Testing Checklist.
5. Mark each task as ✅ in the Goal Summary table when done.

> [!IMPORTANT]
> The `sendMessage()` and `streamChatMessage()` methods in `chat.service.ts` have DUPLICATED logic. Any change to the response flow must be applied to BOTH methods. The streaming version (`streamChatMessage`) starts at line 585 and mirrors the non-streaming version (`sendMessage`) starting at line 331.
