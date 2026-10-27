# CHMSU AI-ITSM Research Datasets & Evaluation Data

This directory contains the authoritative research datasets, empirical exports, and raw evaluator responses supporting the research paper:

> **"Design, Development, and Empirical Evaluation of a Governed Closed-Domain RAG and Intelligent Triage Platform for Higher Education IT Service Management"**  
> *Carlos Hilado Memorial State University (CHMSU) | Institutional Research Project Code: F.01-RDS-CHMSU*

## Dataset Inventory

| File Name | Format | Records | Description |
|:---|:---:|:---:|:---|
| `baseline_paper_requests_320.csv` | CSV | 320 | Pre-intervention archival paper service requests (November 1, 2025 to April 30, 2026), transcribed from official CHMSU ICT Helpdesk physical logbooks. Includes `dateIn`, `dateOut`, `department`, `division` (MIS/ITS), `serviceType`, `retroactivePriority` ($\kappa = 0.89$), `turnaroundWorkingHours`, `slaCompliant`, and `artaSurveySubmitted`. Contains 218 distinct intake clock times with minute precision, 34 entries (10.6%) stamped between 12:00 PM and 1:00 PM (lunch counter drop tray), and 0 intake entries between 16:00 and 17:00 (16:00 public walk-in cut-off). |
| `baseline_paper_requests_320.json` | JSON | 320 | Full structured JSON representation of the 320 baseline requests. |
| `pilot_digital_tickets_339.csv` | CSV | 339 | Full 6-month continuous pilot census (May 1, 2026 to October 26, 2026) submitted through the digital web portal on the campus local intranet (LAN). Primary key IDs run consecutively from 17 through 355 following 16 pre-deployment UAT scenario records. Contains 335 resolved tickets (325 `CLOSED` with completed ARTA CSM surveys, 10 `RESOLVED`) and 4 active `IN_PROGRESS` tickets (0 cancelled / 0 rejected). Ticket control numbers follow `MIS-YYYYMM-XXX` and `ITS-YYYYMM-XXX`. |
| `pilot_digital_tickets_339.json` | JSON | 339 | Full relational JSON export of the 339 pilot tickets including ISO-8601 timestamps, targetHours, holdHours, escalationLevel, and priority attributes. |
| `chat_telemetry_1485.csv` | CSV | 1,485 | Production conversational AI telemetry turn logs across the 6-month pilot deployment. Captures user role, intent classification, multi-tier fallback cascade execution, error types (quota, timeout, socket drop, rate limit, gateway drop), resolving tier, and response latency (ms). Corresponds to Table VI failure modes and latency benchmarks. |
| `chat_telemetry_1485.json` | JSON | 1,485 | Full JSON export of the 1,485 conversational AI telemetry turns. |
| `benchmark_summary_calculated.json` | JSON | Summary | Authoritative computed statistical summary metrics (means, SDs, medians, SLA percentages, Cohen's $d$, odds ratios, and telemetry latency breakdowns). |
| `mccall_software_quality_responses_n5.csv` | CSV | 5 | Item-level ratings across McCall's 11 software quality factors (Product Operation, Revision, Transition) from 5 domain experts (3 internal technical leads, 2 external faculty evaluators). |
| `pssuq_usability_responses_n12.csv` | CSV | 12 | Standardized Post-Study System Usability Questionnaire (PSSUQ v3, items Q1–Q16) raw evaluation responses from 12 institutional stakeholders across four campuses. |

## Data Privacy and Ethical Clearance

All records have been anonymized in strict compliance with **Republic Act No. 10173** (Data Privacy Act of 2012). Personally identifiable information (PII) such as personal telephone numbers, employee IDs, and specific password reset payloads have been expunged or replaced with administrative identifiers (`USR-XX`, `PLB-YYYYMM-XXX`, `MIS-YYYYMM-XXX`). Research activities were conducted under **Institutional Research Project Registration Code F.01-RDS-CHMSU** with informed consent from participating personnel.
