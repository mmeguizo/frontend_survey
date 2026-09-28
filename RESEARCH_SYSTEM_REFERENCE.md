# CHMSU ICT System — Complete Technical Reference for Research Documentation

> **Purpose**: This document is a **comprehensive system reference** for an AI assistant tasked with helping draft a PhD-level published research paper about this system. The AI should consult this document every time a new milestone, chapter, or section of the research paper is being written. It contains the full architectural specification, technical metrics, design rationale, and implementation details needed to produce academically rigorous descriptions.

> **How to use**: When the user is working on a section of their research paper (`RESEARCH_PAPER.md` in the same root), read this document first, then help them write that section with accurate, citation-ready technical descriptions. Always cross-reference the actual codebase for verification.

> **Project Root**: `C:\Users\markm\Desktop\ai ict\ictsystem`  
> **Repository**: `https://github.com/mmeguizo/frontend_survey.git`  
> **Last Updated**: 2026-09-28

---

## Table of Contents

1. [Research Context & Study Title](#1-research-context--study-title)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [AI Integration & RAG Pipeline](#6-ai-integration--rag-pipeline)
7. [Ticket Lifecycle & Workflow Engine](#7-ticket-lifecycle--workflow-engine)
8. [SLA Engine & Automated Escalation](#8-sla-engine--automated-escalation)
9. [Intelligent Auto-Assignment](#9-intelligent-auto-assignment)
10. [Knowledge Management System](#10-knowledge-management-system)
11. [Self-Learning Feedback Loop](#11-self-learning-feedback-loop)
12. [Real-Time Communication Layer](#12-real-time-communication-layer)
13. [Analytics & Reporting Engine](#13-analytics--reporting-engine)
14. [Client Satisfaction Measurement (ARTA CSM)](#14-client-satisfaction-measurement-arta-csm)
15. [Security & Access Control](#15-security--access-control)
16. [Frontend Architecture](#16-frontend-architecture)
17. [Evaluation Instruments](#17-evaluation-instruments)
18. [System Metrics Summary](#18-system-metrics-summary)
19. [Key File Reference Map](#19-key-file-reference-map)

---

## 1. Research Context & Study Title

**Proposed Research Title**: *"Design and Development of an Intelligent Service Request Monitoring and Analysis Platform with AI-Powered Troubleshooting and Predictive SLA Management for the Carlos Hilado Memorial State University ICT Department"*

**Institution**: Carlos Hilado Memorial State University (CHMSU), Philippines  
**Department**: Information and Communications Technology (ICT) Department  
**Research Type**: Applied research — Design Science Research (DSR) methodology  
**Evaluation Framework**: McCall's Software Quality Model + Post-Study System Usability Questionnaire (PSSUQ)

### Research Problem
The CHMSU ICT Department handles service requests (hardware maintenance, software issues, network problems, account management, equipment borrowing) through manual processes — paper forms, walk-ins, and informal communication channels. This results in:
- No centralized tracking of service requests
- No SLA enforcement or visibility into response times
- No institutional knowledge capture from resolved issues
- No self-service troubleshooting capability for end users
- No data-driven insights for resource allocation

### Research Objectives
1. Design and develop a web-based intelligent service request management platform
2. Integrate AI-powered conversational support with Retrieval-Augmented Generation (RAG)
3. Implement automated SLA tracking with multi-tier escalation
4. Create a self-learning knowledge base that grows from resolved tickets
5. Provide real-time analytics and reporting for management decision-making
6. Evaluate the system using McCall's Software Quality Model and PSSUQ

---

## 2. System Overview

The system is a **full-stack web application** serving as an intelligent IT service management (ITSM) platform. It combines traditional helpdesk ticketing with modern AI capabilities to provide:

1. **AI-Powered Chat Assistant** — A conversational chatbot using Google Gemini with RAG that searches solved tickets and knowledge base articles before answering, with automatic fallback to HuggingFace and offline templates
2. **Multi-Stage Approval Workflow** — Service requests flow through Secretary review → Director approval → Department Head assignment → Technical staff resolution → Client satisfaction survey
3. **Automated SLA Management** — Priority-based deadlines with a background cron job that checks every 5 minutes and triggers two-tier escalation notifications
4. **Self-Learning Knowledge Loop** — When tickets are resolved, the system automatically extracts the problem-solution pair, generates vector embeddings, and makes it searchable for future AI conversations
5. **ARTA-Compliant Satisfaction Surveys** — Official government Client Satisfaction Measurement (CSM) survey forms conforming to Philippine Anti-Red Tape Authority standards
6. **Real-Time Operations Dashboard** — Live analytics with 8 chart visualizations, SLA compliance gauges, staff performance metrics, and exportable reports

---

## 3. Technology Stack

### Backend
| Component | Technology | Version/Details |
|-----------|-----------|-----------------|
| Runtime | Node.js | LTS |
| Framework | Express.js | HTTP server |
| API Layer | Apollo Server v4 | GraphQL over HTTP and WebSocket |
| ORM | Prisma | With MySQL provider and `fullTextIndex` preview feature |
| Database | MySQL 8 | With full-text indexing for semantic search |
| AI Primary | Google Gemini (`@google/generative-ai`) | Model: `gemini-2.5-flash` |
| AI Fallback | Hugging Face Inference API | Model: `Qwen/Qwen2.5-72B-Instruct` |
| Embeddings | Google Generative AI | Model: `text-embedding-004` (768-dim vectors) |
| Real-time | `graphql-ws` | WebSocket subscriptions for streaming and live events |
| Scheduling | `node-cron` | Background SLA monitoring every 5 minutes |
| File Upload | Multer | Up to 5 files, 50MB each |
| Reports | ExcelJS | `.xlsx` workbook generation |
| Auth | JWT + Google OAuth 2.0 | Bearer token authentication |

### Frontend
| Component | Technology | Version/Details |
|-----------|-----------|-----------------|
| Framework | Angular | Version 20 (standalone components, Signals, computed properties) |
| UI Library | NG-ZORRO (Ant Design Angular) | `ng-zorro-antd` component suite |
| GraphQL Client | Apollo Angular (`apollo-angular`) | With `@apollo/client` |
| Charts | Chart.js 4+ via `ng2-charts` | 8 visualization types |
| Markdown | `marked` | GitHub Flavored Markdown rendering in chat |
| Rich Text | `ngx-quill` | Knowledge base article editor |
| State Management | Angular Signals | Reactive state without external libraries |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Version Control | Git / GitHub |
| Frontend Hosting | Vercel (production) |
| Backend Hosting | Self-hosted / University server |
| Database Hosting | MySQL on university infrastructure |

---

## 4. System Architecture

### High-Level Architecture Pattern
The system follows a **3-tier client-server architecture** with an AI service layer:

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                      │
│              Angular 20 SPA (Browser)                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Dashboard│ │ Tickets  │ │Analytics │ │ AI Chat      │ │
│  │  Page   │ │  Module  │ │  Module  │ │ Widget       │ │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       └───────────┴────────────┴───────────────┘         │
│                         │                                 │
│              Apollo Client (HTTP + WebSocket)             │
└─────────────────────────┬────────────────────────────────┘
                          │ GraphQL + WS
┌─────────────────────────┼────────────────────────────────┐
│                    APPLICATION TIER                        │
│              Node.js / Express / Apollo Server             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Ticket   │ │ Chat     │ │ AI       │ │ Notification│ │
│  │ Service  │ │ Service  │ │ Service  │ │ Service     │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬──────┘ │
│       │             │            │               │        │
│  ┌────┴─────────────┴────────────┴───────────────┴──────┐│
│  │              Prisma ORM (Query Builder)               ││
│  └───────────────────────┬──────────────────────────────┘│
│                          │                                │
│  ┌───────────────────────┼──────────────────────────────┐│
│  │          AI SERVICE LAYER                             ││
│  │  ┌─────────┐  ┌──────────────┐  ┌────────────────┐  ││
│  │  │ Gemini  │  │ HuggingFace  │  │ Embedding      │  ││
│  │  │ Primary │  │ Fallback     │  │ Service        │  ││
│  │  └─────────┘  └──────────────┘  │ (text-embed-004)│  ││
│  │                                  └────────────────┘  ││
│  └──────────────────────────────────────────────────────┘│
│                                                           │
│  ┌──────────────────────────────────────────────────────┐│
│  │  BACKGROUND SERVICES                                  ││
│  │  • SLA Cron (*/5 * * * *)  • Auto-Assignment Engine  ││
│  │  • Embedding Backfill      • Admin Alert System      ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────┬────────────────────────────────┘
                          │ SQL
┌─────────────────────────┼────────────────────────────────┐
│                      DATA TIER                            │
│                   MySQL 8 Database                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │  16 Tables • 9 Enums • Full-Text Indexes          │  │
│  │  • Ticket workflow state   • Chat message history  │  │
│  │  • Vector embeddings (JSON)• Knowledge articles    │  │
│  │  • SLA tracking metadata   • CSM survey responses  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### API Architecture
- **86 GraphQL operations**: 35 Queries, 45 Mutations, 6 Subscriptions
- **2 REST endpoints**: File upload (`POST /upload/ticket-attachments`) and report download (`GET /reports/download`)
- **Total: 88 API endpoints**

### Communication Protocols
1. **HTTP**: Standard GraphQL queries and mutations via `POST /graphql`
2. **WebSocket**: Real-time subscriptions via `ws://server:4000/graphql` using the `graphql-ws` protocol for:
   - AI chat token streaming (Server-Sent chunks)
   - Live ticket status change notifications
   - New ticket alerts
   - Assignment notifications
   - Bell notification delivery

---

## 5. Database Design

### Schema Statistics
- **16 data models** (tables)
- **9 enumeration types**
- **Database engine**: MySQL 8 with `fullTextIndex` preview feature enabled
- **Full-text indexes**: On `Ticket(title, description)`, `KnowledgeArticle(title, content)`, `TroubleshootingSolution(problem, solution)`

### Entity-Relationship Summary

#### Core Entities

**User** (16 fields) — Central identity entity supporting 8 roles: `ADMIN`, `DEVELOPER`, `TECHNICAL`, `SECRETARY`, `DIRECTOR`, `MIS_HEAD`, `ITS_HEAD`, `USER`. Relates to 11 other entities. Supports Google OAuth (`externalId`) and local password auth. Tracks activation status and last login.

**Ticket** (24 fields) — Primary work item with polymorphic sub-types (`MISTicket` or `ITSTicket`). Tracks the complete lifecycle from submission through resolution with timestamps at each stage. Includes SLA fields (`dueDate`, `estimatedDuration`, `actualDuration`), escalation tracking (`escalationLevel`, `escalatedAt`), and satisfaction data. Full-text indexed on `title` and `description`.

**MISTicket** (9 fields) — Management Information Systems sub-type. Categories: `WEBSITE`, `SOFTWARE`. Boolean flags for: website new request, website update, software new request, software update, software install.

**ITSTicket** (8 fields) — Information Technology Services sub-type. Boolean flags for: borrow request, maintenance desktop/laptop, maintenance internet/network, maintenance printer. Text fields for borrow details and maintenance details.

**ChatSession** (7 fields) — AI conversation container. Statuses: `ACTIVE`, `CLOSED`, `TICKET_CREATED`. Links to the ticket created from the conversation (`ticketId`).

**ChatMessage** (5 fields) — Individual message in a conversation. Roles: `USER`, `ASSISTANT`, `SYSTEM`. Metadata stored as JSON string containing: provider name, response duration, fallback flag, prompt version, web search usage, referenced KB/ticket/solution IDs.

**TroubleshootingSolution** (10 fields) — RAG knowledge entries. Contains problem description, solution steps, category, tags, visibility level. Stores 768-dimensional vector embedding as JSON array for semantic similarity search. Can be auto-generated from resolved tickets or manually authored.

**KnowledgeArticle** (10 fields) — Self-service knowledge base entries. Statuses: `DRAFT`, `PUBLISHED`, `ARCHIVED`. Tracks view count and helpful count. Full-text indexed for RAG retrieval.

**ClientSatisfactionSurvey** (22 fields) — ARTA-compliant CSM survey. Captures demographics (client type, sex, age, region), Citizens Charter awareness (CC1-CC3), and 9 Service Quality Dimensions (SQD0-SQD8) on 5-point Likert scales.

#### Supporting Entities
- **UserSkill** — Technical skill tags for assignment matching
- **TicketAssignment** — Many-to-many join between tickets and assigned staff
- **TicketNote** — Internal and public notes on tickets
- **TicketAttachment** — File attachments with soft-delete capability
- **TicketStatusHistory** — Complete audit trail of every status transition
- **TicketCounter** — Atomic counter for sequential ticket numbering (year/month partitioned)
- **Notification** — 11 notification types with read tracking and JSON metadata

### Ticket Status State Machine (10 States)
```
FOR_REVIEW → REVIEWED → DIRECTOR_APPROVED → ASSIGNED → PENDING → IN_PROGRESS ↔ ON_HOLD → RESOLVED → CLOSED
                                                                                              ↑
FOR_REVIEW / REVIEWED / DIRECTOR_APPROVED ──(rejection)──→ CANCELLED ──(reopen)──→ FOR_REVIEW
```

---

## 6. AI Integration & RAG Pipeline

### Architecture Overview

The AI subsystem implements **Retrieval-Augmented Generation (RAG)** — a technique where the language model's responses are grounded in retrieved institutional knowledge rather than relying solely on its parametric memory. This ensures responses are accurate, institution-specific, and verifiable.

### Provider Priority Chain
```
Priority 1: Google Gemini (gemini-2.5-flash)     — Primary LLM
Priority 2: Hugging Face (Qwen/Qwen2.5-72B)     — Fallback if Gemini fails
Priority 3: Offline rule-based templates          — If all LLMs unavailable
```

Each provider call is wrapped in a configurable timeout (default: 45 seconds). If the primary provider fails or times out, the system automatically cascades to the next provider without user intervention.

### RAG Pipeline (Step-by-Step)

When a user sends a chat message:

1. **Pre-processing & Intent Detection**
   - Check for `/help` command → return capabilities list
   - Check for out-of-scope queries (weather, recipes, politics, etc.) → redirect to ICT topics
   - Check for ticket status queries (regex matches ticket numbers like `MIS-2025-01-001`) → return live ticket data
   - Check for analytics/report requests (role-gated) → return operational data

2. **Context Retrieval (4 parallel data sources)**
   - **Knowledge Base Articles**: MySQL `MATCH(title, content) AGAINST(keywords IN BOOLEAN MODE)` on published articles
   - **Resolved Tickets**: MySQL full-text search on resolved/closed tickets with resolutions and staff notes
   - **Troubleshooting Solutions (keyword)**: MySQL full-text search on the solutions dataset
   - **Troubleshooting Solutions (semantic)**: Cosine similarity of query embedding against stored 768-dim vectors, threshold ≥ 0.4

3. **Result Deduplication & Ranking**
   - Vector similarity results ranked first (higher quality semantic matches)
   - Keyword results appended, deduplicated by ID
   - Top 5 solutions retained

4. **Web Search Decision**
   - If ALL internal sources return empty AND the query is about general IT issues → activate Google Search Grounding via Gemini
   - If the query is about university-specific systems with no internal match → skip web search, prompt immediate ticket creation

5. **Prompt Construction**
   - System prompt establishes persona: warm, empathetic, professional IT technician
   - Context data injected with section headers (KB articles, resolved tickets, solutions, analytics, SLA warnings)
   - Last 10 conversation messages included for continuity
   - Knowledge priority enforced: KB articles > Troubleshooting solutions > Resolved tickets > General knowledge

6. **Response Generation**
   - Streaming mode: Gemini `generateContentStream` → yields token-by-token via WebSocket subscription
   - If streaming fails: fallback to non-streaming `chatCompletion` via HuggingFace, simulated as 20-word chunks with 30ms delays
   - If all providers fail: rule-based offline templates for 6 common issue categories (password, printer, wifi, projector, software, computer)

7. **Ticket Creation from Chat**
   - AI can emit a `ticket-data` JSON block when troubleshooting is exhausted
   - Frontend renders a "Create Support Ticket" button
   - One-click ticket creation links the chat session to the new ticket
   - Sentiment detection: if user is frustrated or demands immediate action → URGENT MODE → skip questions, create ticket immediately

### Vector Embedding Specifications
- **Model**: Google `text-embedding-004`
- **Dimensions**: 768 floating-point values
- **Storage**: MySQL JSON column in `TroubleshootingSolution.embedding`
- **Similarity metric**: Cosine similarity computed in-process
- **Minimum threshold**: 0.4 (configurable)
- **Text preprocessing**: Problem + Solution + Category + Tags concatenated, truncated to 8,000 characters

### AI Response Metadata
Every AI response stores metadata as JSON:
```json
{
  "provider": "Gemini" | "Hugging Face" | "Gemini (Web)" | "Offline",
  "durationMs": 1234,
  "fallback": false,
  "promptVersion": "1.0.0",
  "webSearchUsed": true | false,
  "kbArticleIds": [1, 2],
  "ticketIds": [5, 8],
  "solutionIds": [3, 7]
}
```

### Consecutive Failure Alerting
If AI providers fail 3+ times consecutively, the system automatically creates `STATUS_CHANGED` notifications for all `ADMIN` users with failure details. Throttled to once per hour to prevent notification storms.

---

## 7. Ticket Lifecycle & Workflow Engine

### Complete Workflow (6 Stages)

**Stage 1: Submission** — User creates a ticket via form (manual), AI chat assistant (conversational), or NLP natural language parsing. System generates a sequential ticket number (e.g., `ITS-2026-09-042`), calculates SLA due date based on priority, and notifies all secretaries.

**Stage 2: Secretary Review** — Secretary reviews the request for completeness and validity. Can approve (→ `REVIEWED`) with optional comment, or reject (→ `CANCELLED`) with mandatory reason. Notifications sent to the ticket creator and all directors.

**Stage 3: Director Approval** — Director evaluates the request's merit and resource allocation. Can approve (→ `DIRECTOR_APPROVED`) or disapprove (→ `CANCELLED`) with mandatory justification. Upon approval, the auto-assignment engine is immediately triggered.

**Stage 4: Assignment** — The auto-assignment engine routes the ticket to the appropriate department head (`MIS_HEAD` or `ITS_HEAD`) based on ticket type. Head acknowledges the ticket and assigns a named developer/technician with optional visit date and target completion date. Status transitions: `ASSIGNED` → `PENDING`.

**Stage 5: Resolution** — Technical staff works on the issue. Status can toggle between `IN_PROGRESS` and `ON_HOLD` as needed. When resolved, the department head submits the resolution text. Status changes to `RESOLVED`. The system automatically triggers the self-learning loop (creates a troubleshooting solution from the resolved ticket).

**Stage 6: Closure & Survey** — After resolution, the ticket creator receives an ARTA-compliant Client Satisfaction Measurement survey. Upon survey submission, the ticket transitions to `CLOSED`.

### Ticket Numbering
- **Ticket Number**: `{TYPE}-{YYYYMM}-{SEQUENTIAL}` (e.g., `MIS-2026-09-001`)
- **Control Number**: `{YYYY}-{MM}-{SEQUENTIAL}` (e.g., `2026-09-001`) — globally unique across both departments
- Both use atomic database upserts on `TicketCounter` to prevent race conditions

### Ticket Reopening
Cancelled tickets can be reopened by the original creator, which resets the status to `FOR_REVIEW` and clears all prior review/approval data, effectively restarting the workflow.

---

## 8. SLA Engine & Automated Escalation

### SLA Target Deadlines

| Priority | SLA Deadline | Estimated Duration (MIS) | Estimated Duration (ITS) |
|----------|-------------|--------------------------|--------------------------|
| CRITICAL | 4 hours | 3 hours | 2 hours |
| HIGH | 24 hours (1 day) | 8 hours | 4 hours |
| MEDIUM | 72 hours (3 days) | 16 hours | 8 hours |
| LOW | 168 hours (7 days) | 24 hours | 16 hours |

### SLA Status Assessment
- **Overdue**: `hoursRemaining < 0` (current time exceeds due date)
- **At-Risk**: `0 ≤ hoursRemaining ≤ 4` (approaching deadline)
- **On-Track**: `hoursRemaining > 4`

### SLA Compliance Rate Formula
$$\text{Compliance Rate (\%)} = \frac{\text{Tickets resolved where resolvedAt} \le \text{dueDate}}{\text{Total resolved tickets}} \times 100$$

### Background Monitoring
A `node-cron` job runs every 5 minutes (`*/5 * * * *`) and executes immediately on server startup. It queries all active tickets past their due date that haven't been escalated within the last 30 minutes.

### Two-Tier Escalation Model

**Tier 1 (Level 0 → 1)**: Overdue tickets not yet escalated
- Recipients: All assigned staff + relevant department heads
- Notification type: `SLA_BREACH`
- Message includes hours overdue

**Tier 2 (Level 1 → 2)**: Tickets still overdue 30+ minutes after Tier 1 escalation
- Recipients: All `ADMIN` and `DIRECTOR` users
- Notification type: `TICKET_ESCALATED`
- Signals management attention required

All escalation notifications are delivered in real-time via WebSocket subscriptions.

---

## 9. Intelligent Auto-Assignment

### Routing Algorithm

When a ticket is approved by the Director:

1. **Department Classification**: MIS tickets → `MIS_HEAD`, ITS tickets → `ITS_HEAD`

2. **Sub-category Detection** (from ticket metadata + keyword heuristics):
   - Scans title and description for technical keywords
   - Maps to sub-categories: `WEBSITE`, `SOFTWARE`, `MAINTENANCE_DESKTOP_LAPTOP`, `MAINTENANCE_INTERNET_NETWORK`, `MAINTENANCE_PRINTER`, `BORROW_REQUEST`

3. **Workload-Based Load Balancing**:
   - Queries all active department heads of the target role
   - Counts their current active assignments (excluding resolved/closed/cancelled)
   - Selects the head with the **lowest active workload**
   - Atomic transaction creates assignment and updates ticket status

4. **Manual Override**: Department heads can manually reassign tickets to specific `DEVELOPER` or `TECHNICAL` staff members

---

## 10. Knowledge Management System

### Two Knowledge Sources

1. **Knowledge Base Articles** (`KnowledgeArticle`)
   - Manually authored by ICT staff
   - Lifecycle: `DRAFT` → `PUBLISHED` → `ARCHIVED`
   - Rich text content (HTML via Quill editor)
   - Categorized and tagged for search
   - View count and helpful count tracking
   - Full-text indexed for RAG retrieval
   - Referenced in AI chat via clickable links: `[KB: Article Title](kb:ID)`

2. **Troubleshooting Solutions** (`TroubleshootingSolution`)
   - Auto-generated from resolved tickets OR manually authored
   - Problem-solution pair format
   - Categorized: `NETWORK`, `HARDWARE`, `SOFTWARE`, `PRINTER`, `ACCOUNT`, `SECURITY`, `OTHER`
   - Vector embeddings for semantic search
   - Full-text indexed for keyword search
   - Visibility: `INTERNAL` (staff only) or `PUBLIC`

---

## 11. Self-Learning Feedback Loop

This is a key differentiating feature of the system. When a ticket is resolved:

```
Ticket Resolved
     │
     ▼
┌────────────────────────────────┐
│ Extract problem (title + desc) │
│ Extract solution (resolution   │
│   + public notes)              │
└──────────────┬─────────────────┘
               │
     ┌─────────▼──────────┐
     │ Infer category     │
     │ (regex on content) │
     │ Generate tags      │
     │ (top 5 keywords)   │
     └─────────┬──────────┘
               │
     ┌─────────▼──────────────┐
     │ Save as                │
     │ TroubleshootingSolution│
     │ (deduplicated by       │
     │  ticketId)             │
     └─────────┬──────────────┘
               │
     ┌─────────▼──────────────┐
     │ Async: Generate 768-dim│
     │ vector embedding via   │
     │ text-embedding-004     │
     └─────────┬──────────────┘
               │
     ┌─────────▼──────────────┐
     │ Future chat queries    │
     │ can now find this      │
     │ solution via keyword   │
     │ OR semantic search     │
     └────────────────────────┘
```

This creates a **virtuous cycle**: more resolved tickets → more knowledge → better AI responses → fewer tickets needed for similar issues.

---

## 12. Real-Time Communication Layer

### WebSocket Subscriptions (6)

| Subscription | Trigger | Recipients |
|-------------|---------|------------|
| `chatReplyStream` | AI generates response tokens | Requesting user |
| `ticketStatusChanged` | Any ticket status transition | Subscribed users |
| `ticketCreated` | New ticket submitted | Staff/admin |
| `ticketAssigned` | Ticket assigned to user | Assigned user |
| `ticketAssignmentActivity` | Any assignment change | Staff |
| `notificationCreated` | Any notification generated | Target user |

### Frontend Resilience
- **Primary**: WebSocket streaming for AI chat responses
- **Fallback**: If WebSocket fails, automatically switches to HTTP GraphQL mutation for complete response
- **Visual indicators**: "Reconnecting…" spinner, "Switching to backup AI model…" status text
- **Provider chips**: Show which AI provider generated each response

---

## 13. Analytics & Reporting Engine

### Dashboard Visualizations (8 Charts)

1. **Tickets by Status** — Doughnut chart showing distribution across 10 statuses
2. **Tickets by Department** — Doughnut chart: MIS vs ITS volume
3. **Tickets by Priority** — Bar chart: CRITICAL, HIGH, MEDIUM, LOW counts
4. **Ticket Trends** — Dual-line area chart: daily created vs resolved over time
5. **Staff Workload** — Grouped bar: assigned vs resolved per staff member
6. **MIS vs ITS Status Comparison** — Grouped bar: side-by-side status breakdown
7. **MIS vs ITS Priority Comparison** — Grouped bar: side-by-side priority breakdown
8. **SLA Compliance Gauge** — Radial progress ring with dynamic color (Green ≥90%, Gold ≥70%, Red <70%)

### KPI Cards
- Total Tickets, Resolved Count, SLA Compliance Rate, Overdue Count, Due Today, Due Soon

### Data Tables
- Overdue Tickets table (ticket number, title, department, priority, status, due date, hours overdue)
- Staff Performance table (name, role, assigned count, resolved count, avg resolution time, SLA compliance %)

### Export Capabilities
- **Excel reports** (server-side via ExcelJS): ticket summary, status breakdown, category analysis, priority distribution, monthly trends, full comprehensive report
- **PDF export** (client-side): Analytics dashboard snapshot

---

## 14. Client Satisfaction Measurement (ARTA CSM)

### Compliance Standard
Implements the official **Anti-Red Tape Authority (ARTA) Client Satisfaction Measurement (CSM)** survey form, conforming to **PSA Approval No.: ARTA-2331-3**.

### Survey Structure (2 Pages, 22 Fields)

**Page 1: Demographics & Citizen's Charter**
- Client Type: Citizen, Business, Government
- Demographics: Date, Sex (Male/Female), Age, Region of Residence
- Service Availed: Talisay campus, External campus
- CC1 — Awareness of Citizen's Charter (4-point scale)
- CC2 — Visibility of Citizen's Charter (5-point scale, conditional on CC1)
- CC3 — Helpfulness of Citizen's Charter (4-point scale, conditional on CC1)

**Page 2: Service Quality Dimensions (SQD)**
9 questions on 5-point Likert scale (1 = Strongly Disagree → 5 = Strongly Agree):

| Code | Dimension (English) | Dimension (Filipino) |
|------|---------------------|---------------------|
| SQD0 | Overall satisfaction | Pangkalahatang kasiyahan |
| SQD1 | Reasonable time spent | Makatwirang oras na ginugol |
| SQD2 | Office followed requirements and steps | Sinunod ang mga kinakailangan at hakbang |
| SQD3 | Easy and simple steps/payment | Madali at simpleng mga hakbang |
| SQD4 | Information easily found | Madaling mahanap ang impormasyon |
| SQD5 | Reasonable fees paid | Makatwirang bayad (N/A for free) |
| SQD6 | Fair treatment ("walang palakasan") | Patas na pagtrato |
| SQD7 | Courteous and helpful staff | Magalang at matulungin na kawani |
| SQD8 | Got what was needed | Nakuha ang kailangan |

Plus optional: suggestions/comments text and contact email.

### Analytics Dashboard
- Aggregated SQD scores across all dimensions
- Citizens Charter awareness distribution
- Survey response table with search and date filtering

---

## 15. Security & Access Control

### Authentication Methods
1. **Google OAuth 2.0** — SSO via Google accounts, token exchange at `/graphql` mutation
2. **Local password authentication** — Email/password login with JWT token issuance

### Role-Based Access Control (RBAC) — 8 Roles

| Role | Access Level |
|------|-------------|
| `ADMIN` | Full system access, user management, AI health metrics, all analytics |
| `DIRECTOR` | Ticket approval/disapproval, cross-department analytics, escalation recipient |
| `SECRETARY` | Ticket review/rejection, approval queue management |
| `MIS_HEAD` | MIS ticket assignment, developer delegation, resolution management |
| `ITS_HEAD` | ITS ticket assignment, developer delegation, resolution management |
| `DEVELOPER` | Assigned ticket work, solution authoring |
| `TECHNICAL` | Assigned ticket work, solution authoring |
| `USER` | Ticket submission, AI chat, own ticket tracking, knowledge base access, satisfaction surveys |

### Chat Access Control
- Regular users: troubleshooting, KB lookup, ticket status, ticket creation only
- Staff: additionally access analytics, reports, workload queries, approval information
- Admins: additionally access user directory, AI health metrics, chat session oversight

### Data Protection
- Soft-delete for attachments (preserves audit trail)
- Internal notes visible only to staff (not exposed to ticket creators)
- User deactivation tracking with responsible admin logged

---

## 16. Frontend Architecture

### Component Inventory: 24 Components

| Category | Count | Components |
|----------|-------|-----------|
| Root | 1 | `App` (router outlet) |
| Auth | 2 | `LoginPage`, `AuthCallbackComponent` |
| Layout | 1 | `MainLayout` (sidebar, header, chat widget host) |
| Shared | 3 | `ChatWidgetComponent`, `NotificationBellComponent`, `PageHeaderComponent` |
| Features | 16 | Dashboard, Admin, Analytics, Approvals, Tickets (5 sub-components), Solutions, Knowledge Base, Notifications, Docs, Surveys, Survey Form |
| Welcome | 1 | `Welcome` landing page |

### Key Frontend Patterns
- **Standalone components** (no NgModules)
- **Angular Signals** for reactive state management
- **Computed properties** for derived chart data
- **OnPush change detection** for performance
- **`effect()`** watchers for real-time data refresh
- **Pointer capture** drag-and-drop for chat widget positioning
- **Markdown rendering** with custom protocol handlers (`kb:`, report links)

---

## 17. Evaluation Instruments

### Instrument 1: McCall's Software Quality Model
**Target evaluators**: 5 ICT expert evaluators  
**Evaluation areas** (3 quality perspectives):

1. **Product Operation** — Correctness, reliability, efficiency, integrity, usability
2. **Product Revision** — Maintainability, flexibility, testability
3. **Product Transition** — Portability, reusability, interoperability

**Document**: `docs/McCalls_Expert_Questionnaire.docx`

### Instrument 2: Post-Study System Usability Questionnaire (PSSUQ)
**Target respondents**: 10 end users  
**Measurement scales**:

1. **System Usefulness (SYSUSE)** — Items 1-6
2. **Information Quality (INFOQUAL)** — Items 7-12
3. **Interface Quality (INTQUAL)** — Items 13-16

**Document**: `docs/PSSUQ_User_Questionnaire.docx`

### Instrument 3: User Acceptance Testing (UAT)
**Test scenarios**: End-user ticket submission, AI assistance, approval workflows, assignment, resolution, satisfaction surveys  
**Document**: `docs/UAT_TEST_CASES.md`

### Instrument 4: Tester Record Sheet
**Purpose**: Observation log during evaluation sessions  
**Captures**: User role, tasks completed, time elapsed, errors encountered  
**Document**: `docs/Tester_Record_Sheet.docx`

---

## 18. System Metrics Summary

| Metric | Value |
|--------|-------|
| Prisma Data Models | 16 |
| Prisma Enums | 9 |
| GraphQL Queries | 35 |
| GraphQL Mutations | 45 |
| GraphQL Subscriptions | 6 |
| REST Endpoints | 2 |
| **Total API Endpoints** | **88** |
| Angular Components | 24 |
| Chart Visualizations | 8 |
| Ticket Statuses | 10 |
| User Roles | 8 |
| Notification Types | 11 |
| Offline Fallback Templates | 6 |
| SLA Priority Levels | 4 |
| Escalation Tiers | 2 |
| Embedding Dimensions | 768 |
| CSM Survey Questions | 12 (CC1-CC3 + SQD0-SQD8) |
| CSM Likert Scale Points | 5 |

---

## 19. Key File Reference Map

### Backend Core
| File | Purpose |
|------|---------|
| `backend/src/index.ts` | Express bootstrap, Apollo Server, WebSocket, REST routes |
| `backend/src/config/index.ts` | AI keys, models, timeouts, CORS config |
| `backend/prisma/schema.prisma` | Complete database schema (16 models, 9 enums) |

### AI Layer
| File | Purpose |
|------|---------|
| `backend/src/lib/llm-client.ts` | Multi-provider LLM client (Gemini + HuggingFace), streaming, web search grounding |
| `backend/src/modules/ai/gemini.service.ts` | Ticket analysis, NLP parsing, JSON repair |
| `backend/src/modules/ai/ai.resolvers.ts` | Smart suggestions, ticket analysis, NLP resolvers |
| `backend/src/modules/chat/chat.service.ts` | Core RAG pipeline (~3100 lines), prompt engineering, offline templates, context retrieval |
| `backend/src/modules/chat/chat.resolvers.ts` | Chat queries, mutations, streaming subscription |
| `backend/src/modules/chat/embedding.service.ts` | Vector embedding generation, cosine similarity, semantic search |

### Ticket Engine
| File | Purpose |
|------|---------|
| `backend/src/modules/tickets/services/ticket.service.ts` | Full ticket lifecycle, approval chain, resolution, SLA calculation |
| `backend/src/modules/tickets/services/auto-assignment.service.ts` | Workload-based intelligent routing |
| `backend/src/lib/sla-cron.service.ts` | Background SLA monitoring and 2-tier escalation |
| `backend/src/modules/solutions/solution.service.ts` | Solution dataset, auto-creation from resolved tickets |

### Frontend Core
| File | Purpose |
|------|---------|
| `frontend/src/app/shared/components/chat-widget.component.ts` | Floating AI chat widget (draggable, streaming, ticket creation) |
| `frontend/src/app/features/analytics/analytics.page.ts` | 8-chart analytics dashboard |
| `frontend/src/app/features/tickets/submit-ticket.page.ts` | Ticket submission with 3 AI touchpoints |
| `frontend/src/app/features/tickets/survey/survey-form.component.ts` | ARTA CSM survey form |
| `frontend/src/app/features/surveys/surveys.page.ts` | Survey analytics dashboard |
| `frontend/src/app/features/approvals/secretary-approval.page.ts` | Secretary & Director approval queue |

### Documentation
| File | Purpose |
|------|---------|
| `docs/AI_INTEGRATION_POINTS.md` | Research-to-code mapping document |
| `docs/BACKEND_API_MANUAL.md` | Complete API reference (v2.5.0) |
| `docs/USER_MANUAL.md` | End-user manual (v2.8.0) |
| `docs/UAT_TEST_CASES.md` | User acceptance test cases |
| `docs/McCalls_Expert_Questionnaire.docx` | McCall quality model instrument |
| `docs/PSSUQ_User_Questionnaire.docx` | PSSUQ usability instrument |
| `docs/TESTING_QUESTIONNAIRES_MCCALL_PSSUQ.md` | Combined evaluation protocol |
