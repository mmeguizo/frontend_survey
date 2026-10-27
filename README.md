# AI-Augmented IT Service Management (ITSM) Platform for Higher Education

An enterprise-grade, design science research platform engineered for public higher education institutions under Philippine statutory mandates (**Republic Act No. 11032** / Anti-Red Tape Authority and **Republic Act No. 10173** / Data Privacy Act). Built with **Angular 20 (v20.3.0)** standalone architecture, **Node.js / Express**, **Apollo GraphQL**, **Prisma ORM**, **MySQL 8.0**, and a **closed-loop RAG knowledge engine** with a four-tier graceful AI inference fallback cascade.

Deployed and empirically evaluated at **Carlos Hilado Memorial State University (CHMSU)** under **Institutional Research Project Registration Code F.01-RDS-CHMSU**.

---

## Key Features & Research Contributions

1. **Governed Six-Stage, 10-State Workflow:** Reconciles institutional multi-signatory approval chains (Requesting Office → ICT Secretary → ICT Director → Department Head → Technician) with statutory turnaround deadlines. Finite states: `FOR_REVIEW`, `REVIEWED`, `DIRECTOR_APPROVED`, `ASSIGNED`, `IN_PROGRESS`, `ON_HOLD`, `RESOLVED`, `CLOSED`, and `CANCELLED`.
2. **Dual-Division Polymorphic Service Catalog:** Tailored dispatching separating software/database issues (**MIS**) from hardware/network/borrowing requisitions (**ITS**).
3. **Lexicographical Skill-and-Workload Auto-Triage:** Automatically matches pending incident requirements to technicians based on verified domain skill tags and active queue backlogs.
4. **Statutory SLA Daemon & Two-Tier Escalation:** Background cron service monitoring business-hour countdown timers (08:00–12:00, 13:00–17:00, 8h/day, excluding weekends and official public holidays). Pauses during authorized `ON_HOLD` intervals; triggers Tier 1 (technician/unit head alert) and Tier 2 (executive director notification) escalations upon SLA breach.
5. **Architectural ARTA CSM Survey Gating:** Programmatically gates ticket closure upon completion of the mandatory digital Anti-Red Tape Authority Client Satisfaction Measurement (ARTA-2331-3) instrument.
6. **Closed-Loop SECI Knowledge Capture & RAG Assistant:** Automatically extracts verified diagnostic troubleshooting notes upon ticket resolution into 768-dimensional semantic embeddings, externalizing tacit institutional memory for future end-user self-service.
7. **Epistemic Provenance Routing & 4-Tier Graceful Cascade:** Restricts campus policy inquiries to verified internal corpora while routing generic technical questions across four inference tiers: Google Gemini 2.5 Flash, Perplexity Online SSE, Hugging Face Qwen2.5-72B, and deterministic local offline templates.

---

## Role-Based Access Control (RBAC) Hierarchy

The platform implements 8 strict database roles defined in `backend/prisma/schema.prisma`:
- `USER`: Campus faculty, administrative personnel, and students creating service tickets, tracking status, and submitting ARTA surveys.
- `SECRETARY`: ICT Office Secretary conducting intake verification, completeness checks, and administrative screening.
- `DIRECTOR`: ICT Executive Director authorizing institutional resources and auditing SLA breaches.
- `MIS_HEAD`: Head of Management Information Systems managing software bug fixes, enterprise portal updates, and diagnostic vector auditing.
- `ITS_HEAD`: Head of Information Technology Services overseeing hardware repairs, network infrastructure, and equipment borrowing.
- `TECHNICAL`: Frontline hardware and network field technicians logging on-site diagnostics and resolution actions.
- `DEVELOPER`: Software engineers handling application patches, database scripts, and code deployments.
- `ADMIN`: System administrators configuring roles, campus directories, SLA countdown parameters, and audit trails.

---

## Research Datasets and Benchmark Scripts

To support open science, external validation, and doctoral peer review, all evaluation datasets and benchmark scripts are published directly in this repository:

- [`data/`](./data/): Contains complete raw datasets:
  - `baseline_paper_requests_320.csv` / `.json`: 320 archival physical logbook records (November 2025–April 2026).
  - `pilot_digital_tickets_339.csv` / `.json`: 339 live pilot tickets (May–October 2026; 335 resolved, 4 in-progress).
  - `benchmark_summary_calculated.json`: Authoritative computed summary metrics matching paper tables.
  - `mccall_software_quality_responses_n5.csv`: Expert evaluation sheets ($n = 5$ domain experts, 11 McCall factors).
  - `pssuq_usability_responses_n12.csv`: Usability test responses ($n = 12$ institutional evaluators, PSSUQ v3).
- [`benchmarks/`](./benchmarks/): Standalone execution scripts for IR ablation and statistical analysis:
  - `verify_paper_integrity.py`: Audits numerical consistency between manuscript and datasets.
  - `evaluate_rag_ablation.py`: Computes P@5, R@5, MRR, answer faithfulness, and hallucination rates across 7 arms.
  - `generate_unified_benchmarks.py`: Single-source-of-truth compiler generating all vector publication figures.
  - `extract_and_compute_benchmarks.py`: Computes Mann-Whitney $U$, Cohen's $d$, Chi-Square, and Wilson score CIs.

---

## Tech Stack

### Frontend
- **Framework:** Angular 20 (v20.3.0) with Standalone Components & Signal-based state management
- **UI Library:** Ng-Zorro-AntD (v20.3.1)
- **GraphQL Client:** Apollo Client (v4.0.1) & Apollo Angular (v12.0.0)
- **Visualizations:** Chart.js (v4.5.1) & Ng2-Charts (v8.0.0)
- **Document Rendering:** jsPDF & Marked (Markdown parsing)

### Backend
- **Runtime:** Node.js (v20+) with Express
- **API Architecture:** Apollo Server (GraphQL v16) with WebSocket subscriptions
- **ORM & Database:** Prisma ORM with MySQL 8.0
- **Authentication:** Dual-mode Auth0 OpenID Connect (OIDC) SSO + Local JWT Authentication
- **AI Orchestration:** Google Gemini 2.5 Flash, Perplexity API, Hugging Face Inference API, and local deterministic fallback engine

---

## Getting Started

### Prerequisites
- Node.js 20+ LTS
- MySQL 8.0+
- npm (v10+) or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/mmeguizo/ictFinalSystem.git
cd ictFinalSystem
```

### 2. Configure and Seed Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL and API credentials in .env

npx prisma migrate dev
npx prisma generate

# Seed database with authoritative 6-month research dataset
node prisma/seed_realistic_dataset.js

# Start backend GraphQL server
npm run dev
```

### 3. Start Frontend Client
```bash
cd ../frontend
npm install
npm start
# Navigate to http://localhost:4200
```

---

## Verification & Integrity Audit

To verify complete concordance between the repository data files and the research paper:
```bash
python benchmarks/verify_paper_integrity.py
```

---

## AI-Assisted Development Disclosure

In compliance with IEEE Authorship Policies and institutional ethics standards, AI-assisted coding tools (Cursor, GitHub Copilot, and Google Gemini) were utilized during the development phase solely for boilerplate code implementation, unit test scaffolding, and typographical copy-editing. Configuration files (`.cursorrules`, `.copilot-context.md`, `.github/agents`) are preserved in this repository for development transparency. All system architectures, mathematical formulations, database schemas, experimental protocols, data collection, and analytical conclusions were devised, executed, and validated exclusively by the human authors.

---

## Citation & Institutional Inquiries

```bibtex
@article{delatorre2026itsm,
  author    = {Russel M. Dela Torre and Mark Oliver Meguizo and Rodney Ormeo and Ernie L. Aguirre},
  title     = {Design, Development, and Empirical Evaluation of a Governed Closed-Domain RAG and Intelligent Triage Platform for Higher Education IT Service Management},
  institution = {Carlos Hilado Memorial State University},
  year      = {2026},
  note      = {Institutional Research Project Code: F.01-RDS-CHMSU}
}
```

For administrative inquiries: `ict.office@chmsu.edu.ph` | Carlos Hilado Memorial State University, Talisay City, Negros Occidental, Philippines.
