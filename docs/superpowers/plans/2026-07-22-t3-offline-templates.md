# T3 — Local Offline Response Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `ChatService.fallbackResponse()` with 6 issue-specific templates for common ICT problems.

**Architecture:** Add a `issueTemplates` record inside `fallbackResponse()` checked before existing ticket/context/generic branches. Each template matches keywords via regex and returns a friendly step-by-step response with a `ticket-data` block for escalation.

**Tech Stack:** NestJS/TypeScript, `backend/src/modules/chat/chat.service.ts` only.

**Spec:** `docs/superpowers/specs/2026-07-22-t3-offline-templates-design.md`

## Global Constraints

- No new files — all changes in `backend/src/modules/chat/chat.service.ts`
- Existing code paths (ticket creation, context match, generic fallback) must remain intact
- At least 5 templates with `ticket-data` block when appropriate
- TypeScript checks must pass

---

### Task 1: Add issue templates to `fallbackResponse()`

**Files:**
- Modify: `backend/src/modules/chat/chat.service.ts:2407-2476`

**Interfaces:**
- Consumes: existing `fallbackResponse(message: string, contextData: string): string` signature
- Produces: expanded `fallbackResponse()` with template routing

- [ ] **Step 1: Read the current `fallbackResponse()` to understand insertion point**

Read lines 2407-2476 of `chat.service.ts` to confirm the existing code structure.

- [ ] **Step 2: Add the `issueTemplates` record and routing logic**

Insert right after the opening of `fallbackResponse()` and before the ticket-intent check:

```typescript
// --- Issue-specific fallback templates ---
const msgLower = message.toLowerCase();

interface IssueTemplate {
  pattern: RegExp;
  response: string;
  requiresTicket?: boolean;
}

const issueTemplates: IssueTemplate[] = [
  {
    pattern: /\b(password|forgot.*(login|pass)|account.*(lock|reset)|can't.*(log|sign))/i,
    response: `I can help you with a password or account issue! Here are a few things you can try first:

1. **Self-service password reset** — Visit the ICT portal at [Password Reset](kb:password-reset) and follow the steps.
2. **Verify your identity** — Make sure your registered mobile number or email is accessible for the OTP.
3. **MFA / Authenticator app** — If you're locked out of your authenticator app, contact the ICT help desk to have it reset.

If you've already tried these steps and still can't access your account, I can raise a ticket for the ICT team:

\`\`\`ticket-data
{
  "title": "Support Request: Password Reset / Account Help",
  "description": "User requested account/password assistance via chat: '${message.replace(/"/g, '\\"')}'",
  "type": "MIS",
  "priority": "HIGH",
  "category": "ACCOUNT",
  "staffNote": "⚠️ Created via offline fallback — user may need MFA reset or account unlock."
}
\`\`\`

Would you like to submit this ticket, or try the self-service options first?`,
  },
  {
    pattern: /\b(printer|paper.?jam|can't print|not printing|print.?queue|toner|ink)/i,
    response: `Let's troubleshoot your printer issue. Try these steps:

1. **Check power and connections** — Make sure the printer is turned on and the USB/network cable is securely connected.
2. **Check paper and ink/toner** — Open the printer and look for paper jams, low ink, or empty trays.
3. **Clear the print queue** — Go to *Settings > Devices > Printers & Scanners*, select your printer, and click *Open print queue*. Cancel any stuck documents and try printing again.
4. **Restart the printer** — Turn it off, wait 30 seconds, and turn it back on.

If none of these steps resolve the problem, I can create a support ticket for a technician:

\`\`\`ticket-data
{
  "title": "Support Request: Printer / Hardware Issue",
  "description": "User reported printer issue via chat: '${message.replace(/"/g, '\\"')}'",
  "type": "ITS",
  "priority": "MEDIUM",
  "category": "HARDWARE",
  "staffNote": "⚠️ Created via offline fallback — basic troubleshooting steps were provided."
}
\`\`\`

Would you like to submit the ticket, or try the steps above?`,
  },
  {
    pattern: /\b(wi.?fi|wifi|internet|connect.*network|no.*connection|network.*down|can't browse)/i,
    response: `Here are some steps to get you back online:

1. **Toggle Wi-Fi** — Turn Wi-Fi off and on again on your device.
2. **Restart your router** — Unplug the power, wait 30 seconds, and plug it back in. Wait 2 minutes for it to reboot.
3. **Try a wired connection** — If possible, connect your device directly to the network with an Ethernet cable.
4. **Check other devices** — If other devices work but yours doesn't, the issue is likely device-specific.

If the problem persists, I can log a ticket for the network team:

\`\`\`ticket-data
{
  "title": "Support Request: Wi-Fi / Network Issue",
  "description": "User reported network connectivity issue via chat: '${message.replace(/"/g, '\\"')}'",
  "type": "ITS",
  "priority": "HIGH",
  "category": "NETWORK",
  "staffNote": "⚠️ Created via offline fallback — basic network troubleshooting was provided."
}
\`\`\`

Need me to submit the ticket, or would you like to try the steps above first?`,
  },
  {
    pattern: /\b(projector|av.?equip|presentation.*room|borrow.*projector|audio.?visual|screen.*conf(erence)?)/i,
    response: `Here's how to arrange AV equipment for your presentation:

1. **Check availability** — AV equipment (projectors, screens, speakers) can be booked through the ICT office.
2. **What you need** — Let me know which room you're presenting in and what equipment you need (projector, laptop adapters, speakers, microphone).
3. **Booking lead time** — Please request at least 24 hours in advance to ensure availability.
4. **Pickup location** — Equipment is collected from the ICT Help Desk (Building A, Ground Floor).

I can set up a ticket to book the equipment for you:

\`\`\`ticket-data
{
  "title": "Support Request: AV Equipment Booking",
  "description": "User requested AV equipment via chat: '${message.replace(/"/g, '\\"')}'",
  "type": "ITS",
  "priority": "MEDIUM",
  "category": "GENERAL",
  "staffNote": "⚠️ Created via offline fallback — please confirm room, date, and equipment needed."
}
\`\`\`

Would you like me to submit this booking request?`,
  },
  {
    pattern: /\b(install.*(software|program|app)|need.*(program|tool|app)|email.*(setup|config)|outlook|applicat(ion| software))/i,
    response: `To request new software or set up an application:

1. **Approval required** — Software installations require your supervisor's approval for licensing and compliance.
2. **Request process** — Submit a ticket with the software name, version (if known), and why you need it.
3. **Self-service options** — Check the ICT Software Center on your computer for pre-approved applications you can install directly.
4. **Email setup** — For Outlook or email configuration, you'll need your full email address and server settings (provided after ticket approval).

I can start the request process for you:

\`\`\`ticket-data
{
  "title": "Support Request: Software / Application Request",
  "description": "User requested software or application setup via chat: '${message.replace(/"/g, '\\"')}'",
  "type": "ITS",
  "priority": "MEDIUM",
  "category": "SOFTWARE",
  "staffNote": "⚠️ Created via offline fallback — supervisor approval may be required before installation."
}
\`\`\`

Shall I submit this request?`,
  },
  {
    pattern: /\b(computer.*(slow|freeze|crash)|laptop.*(turn|start|battery)|blue.?screen|device.*(issue|problem)|pc.*not)/i,
    response: `Let's troubleshoot your computer issue:

1. **Restart your computer** — A simple restart often resolves temporary glitches. Save your work and reboot.
2. **Check for updates** — Go to *Settings > Update & Security > Windows Update* and install any pending updates.
3. **Run in Safe Mode** — If the computer crashes on startup, try booting in Safe Mode (press F8 during boot) to diagnose the issue.
4. **Check disk space** — Low disk space can cause slow performance. Free up space by deleting temporary files.

If these steps don't help, I can create a ticket for our hardware team:

\`\`\`ticket-data
{
  "title": "Support Request: Computer / Device Issue",
  "description": "User reported computer issue via chat: '${message.replace(/"/g, '\\"')}'",
  "type": "ITS",
  "priority": "MEDIUM",
  "category": "HARDWARE",
  "staffNote": "⚠️ Created via offline fallback — basic troubleshooting steps were provided."
}
\`\`\`

Would you like to submit a ticket for further assistance?`,
  },
];

// Check issue-specific templates first
for (const tmpl of issueTemplates) {
  if (tmpl.pattern.test(message)) {
    return tmpl.response;
  }
}
```

Place this block right after `const isTicketIntent = ...` checks, before the ticket creation branch.

Actually, insert it right before the `if (isTicketIntent)` check — so issue templates are checked first, then ticket intent, then context, then generic.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd backend && npx tsc --noEmit --pretty`
Expected: No errors.

- [ ] **Step 4: Run lint**

Run: `cd backend && npx eslint src/modules/chat/chat.service.ts --max-warnings 0` (or applicable lint command)
Expected: No errors or warnings.

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/chat/chat.service.ts
git commit -m "feat: add 6 offline fallback templates for common ICT issues"
```
