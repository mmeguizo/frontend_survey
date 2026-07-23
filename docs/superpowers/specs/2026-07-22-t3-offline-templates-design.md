# T3 — Local Offline Response Templates

## Purpose
Expand the curated fallback responses in `ChatService.fallbackResponse()` with richer, issue-specific templates for common ICT problems. These activate when all AI providers are unreachable.

## Design

### Template record
A private record `issueTemplates` mapping regex patterns to response generators:

```typescript
private readonly issueTemplates: Array<{
  pattern: RegExp;
  generate: (message: string) => string;
}> = [ ... ]
```

### Templates (6 total)

| # | Issue | Triggers | Key details |
|---|-------|----------|-------------|
| 1 | **Password Reset** | `password`, `forgot.*login`, `account.*lock`, `can't.*log` | Steps: reset portal, verify identity, MFA recovery. Ticket-data for escalation. |
| 2 | **Printer Issue** | `printer`, `paper.?jam`, `can.*print` | Steps: power check, paper/ink check, queue clear. Ticket-data for repair. |
| 3 | **Wi-Fi / Network** | `wi.?fi`, `internet`, `connect.*network`, `no.*connection` | Steps: toggle WiFi, restart router, try wired. Ticket-data if persists. |
| 4 | **Projector / AV** | `projector`, `av.?equip`, `presentation`, `borrow.*projector` | Steps: booking process, room requirements, cable check. Ticket-data for booking. |
| 5 | **Software Install** | `install.*software`, `need.*program`, `email.*setup`, `outlook` | Steps: request process, admin approval needed, timeline. Ticket-data. |
| 6 | **Computer Issue** | `computer.*slow`, `laptop.*turn`, `blue.?screen` | Steps: restart, check updates, safe mode. Ticket-data for hardware. |

### Flow within `fallbackResponse()`

```
message → issue template match? → yes → return template response
        → no  → ticket intent?   → yes → return existing ticket flow
              → no  → context?    → yes → return existing context response
                    → no          →      return existing generic fallback
```

### Files changed
- `backend/src/modules/chat/chat.service.ts` — add template logic inside `fallbackResponse()`

### What stays the same
- All existing code paths (ticket creation, context match, generic fallback) remain intact
- No schema, resolver, or frontend changes
