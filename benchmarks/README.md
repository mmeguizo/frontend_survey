# Empirical Benchmarks and Reproducibility Suite

This directory contains standalone, reproducible Python evaluation and verification scripts enabling independent researchers, conference reviewers, and doctoral committee members to verify and reproduce all empirical findings reported in the paper:

> **"AI-Augmented IT Service Management in Philippine Higher Education: A Governed DSR Framework for Administrative Alignment, Epistemic Provenance, and Turnaround Velocity"**
> *Authors: Russel M. Dela Torre, Mark Oliver Meguizo, Rodney Ormeo, and Ernie L. Aguirre*  
> *Carlos Hilado Memorial State University (CHMSU) & Colegio de La Castellana*  
> *Institutional Project Registration Code: F.01-RDS-CHMSU*

---

## Benchmark Script Index

| Script Name | Target Construct / Paper Table | Description and Execution |
|:---|:---|:---|
| `verify_paper_integrity.py` | Full Paper Integrity & Ground Truth | Automated gatekeeper that cross-checks all metrics across Markdown (`RESEARCH_PAPER_V4_COMPLETE.md`, `RESEARCH_PAPER.md`), LaTeX (`IEEE_CONFERENCE_PAPER.tex`), Word (`IEEE_RESEARCH_PAPER_FINAL.docx`), and PDF (`IEEE_RESEARCH_PAPER_DOCTORATE_FINAL.pdf`) against authoritative data. |
| `generate_unified_benchmarks.py` | Figures 1 through 5 | Renders publication-grade charts from `benchmark_summary_calculated.json`: System Architecture, Swimlane Workflow, Priority Lifecycles, RAG Ablations, and Multi-Tier Telemetry Latencies. |
| `extract_and_compute_benchmarks.py` | Tables IV, V, VI, VII, VIII, IX | Computes exact descriptive statistics, Mann-Whitney $U$ non-parametric ranks, pooled Cohen's $d$ effect sizes, Pearson Chi-square contingency tests, and 95% Wilson score confidence intervals directly from CSV files. |
| `evaluate_rag_ablation.py` | Table V (RAG Ablation Benchmark) | Evaluates Precision@5, Recall@5, MRR, answer faithfulness, hallucination rate, and campus provenance query gating across all 7 experimental arms ($N = 100$ labeled queries). |

---

## Statistical Methodology and Formulas

1. **Net vs. Gross Mean Time to Resolution (MTTR):**
   - Operating hours strictly adhere to Philippine Civil Service Commission (CSC) working schedules (08:00–12:00 and 13:00–17:00, Monday through Friday, 8 net working hours/day, excluding lunch breaks, weekends, and holidays).
   - **Net MTTR:** Deducts authorized `ON_HOLD` intervals (such as awaiting user diagnostics or third-party hardware replacement procurement).
   - **Gross MTTR:** Unpaused continuous business hours elapsed between intake submission and technical resolution sign-off.
2. **Pooled Cohen's $d$ Effect Size:**
   $$d = \frac{\bar{X}_1 - \bar{X}_2}{s_{\text{pooled}}}, \quad s_{\text{pooled}} = \sqrt{\frac{(n_1 - 1)s_1^2 + (n_2 - 1)s_2^2}{n_1 + n_2 - 2}}$$
   - MIS Software: Baseline $\bar{X} = 48.83, s = 20.54, n = 128$; Pilot $\bar{X} = 19.32, s = 19.48, n = 135 \implies d = 1.47$ (Large effect).
   - ITS Hardware: Baseline $\bar{X} = 33.04, s = 14.37, n = 192$; Pilot $\bar{X} = 20.11, s = 23.70, n = 200 \implies d = 0.66$ (Moderate-Large effect).
   - Overall Net MTTR: Baseline $\bar{X} = 39.36, s = 18.75, N = 320$; Pilot $\bar{X} = 19.79, s = 22.07, n = 335 \implies d = 0.95$ (Large effect).
   - Gross Pilot MTTR: Baseline $\bar{X} = 39.36, s = 18.75, N = 320$; Pilot Gross $\bar{X} = 22.84, s = 22.47, n = 335 \implies d = 0.80$ (Large effect).
3. **Statutory Odds Ratios (Fisher's Exact / Chi-Square):**
   - Statutory SLA Compliance: Baseline $235/320$ (73.44%) vs. Pilot $311/335$ (92.84%) $\implies \text{OR} = 4.69, p < 0.001$.
   - ARTA CSM Survey Completion: Baseline $76/320$ (23.75%) vs. Pilot $325/335$ (97.01% among resolved) $\implies \text{OR} = 104.34, p < 0.001$ (or $325/339 = 95.87\%$ across total census $\implies \text{OR} = 74.53, p < 0.001$).

---

## Step-by-Step Reproduction Guide

To run the verification suite and re-evaluate all statistics:

```bash
# 1. Verify paper integrity and ground-truth numerical concordance
python verify_paper_integrity.py

# 2. Extract and recompute all empirical metrics from raw CSVs
python tools/generate_ground_truth_dataset.py

# 3. Generate all figures
python generate_unified_benchmarks.py

# 4. Compile paper deliverables
python build_8page_paper.py        # Generates RESEARCH_PAPER_V4_COMPLETE.md & RESEARCH_PAPER.md
python build_ieee_pdf.py           # Generates IEEE_RESEARCH_PAPER_DOCTORATE_FINAL.pdf (13 pages)
python build_ieee_word_doc.py      # Generates IEEE_RESEARCH_PAPER_FINAL.docx
python build_ieee_latex.py         # Generates IEEE_CONFERENCE_PAPER.tex
```

All scripts execute using standard Python 3.10+ packages (`json`, `csv`, `math`, `random`, `re`, `pypdf`, `reportlab`, `python-docx`) without complex external dependencies.
