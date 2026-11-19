---
title: "RAG Evaluation Questions and Expected Behaviours"
category: "Source Registry"
source_type: "Quality Assurance Test Set"
source_urls:
  - "https://uswat.edu.pk/"
  - "https://www.hec.gov.pk/english/universities/Pages/KPK/University-of-Swat.aspx"
  - "https://www.hec.gov.pk/english/universities/Pages/DAIs/HEC-recognized-Campuses.aspx"
document_date: null
accessed_date: "2026-11-18"
academic_session: null
verification_status: "verified_with_caveats"
last_verified_date: "2026-11-18"
source_authority: "Knowledge-base evaluation specification"
is_time_sensitive: true
valid_from: null
valid_until: null
source_keys: [home, hec_profile, hec_campuses]
---
# RAG Evaluation Questions and Expected Behaviours

Use this set to evaluate retrieval and answer grounding. These are expected behaviours derived from the current knowledge-base contents, not evidence of a live Gemini/RAG integration test.

| ID | Test question | Expected answer behaviour | Relevant file(s) | Result class |
|---|---|---|---|---|
| UOS-01 | When was University of Swat established? | State the formal establishment date as 7 July 2010; distinguish it from the earlier public announcement if relevant. Cite the legal/HEC source. | `00-university-overview/legal-status-and-recognition.md`; `history.md` | Answer |
| UOS-02 | What is the university's vision? | Summarise only the wording recorded in the official vision/mission file and cite its official About page. | `00-university-overview/vision-mission-values.md` | Answer |
| UOS-03 | Where is the Main Campus? | Answer Charbagh, Swat, KP, Pakistan. Do not replace it with HEC's separate Odigram contact address. | `00-university-overview/campuses.md`; `campus-status.md` | Answer with distinction |
| UOS-04 | Is Shangla Campus still part of University of Swat? | Explain historical association and HEC-recorded upgrade to University of Shangla effective 1 August 2022. | `00-university-overview/campus-status.md`; `campuses.md` | Answer |
| UOS-05 | Is Women Campus currently HEC-recognised? | Do not answer yes. State that HEC's listed validity ends 30 September 2025 and current renewal is unconfirmed in this archive; refer user to HEC/university. | `00-university-overview/campus-status.md`; `campuses.md` | Cautious / escalate |
| UOS-06 | What is the last date to apply for admission? | Do not invent a date. State that no current deadline is verified and direct user to latest official admissions notice. | `01-admissions/admission-deadlines.md`; `research-gaps.md` | Abstain |
| UOS-07 | What percentage is required for BS Information Technology admission? | Do not invent eligibility. State programme-specific current criteria are not established in the archive. | `02-academics/departments.md`; `research-gaps.md` | Abstain |
| UOS-08 | What is the current BS admission and semester fee? | Do not present the approximately 2024 schedule as current. Disclose that current fees are unconfirmed and refer to latest official schedule. | `01-admissions/fee-structure.md`; `research-gaps.md` | Abstain / historical context only |
| UOS-09 | Where can students access university digital services? | Provide only the public portal link(s) recorded in the digital-services file; clarify that listed service areas do not prove universal access or current operational status. | `04-student-services/official-digital-services.md` | Answer with caveat |
| UOS-10 | List all departments and programmes. | Provide only the supported department/faculty listing and state that a complete current programme directory is not available. Do not claim exhaustive coverage. | `02-academics/departments.md`; `02-academics/faculties.md`; `research-gaps.md` | Partial answer |

## Automated evaluation checklist

- Every factual answer has at least one relevant retrieved chunk and source URL.
- The answer does not cite a source that was not retrieved or listed for the chunk.
- Time-sensitive facts include their date and status caveat.
- The model abstains on unsupported deadlines, eligibility and current fees.
- Conflicting address contexts are not merged.
- The model distinguishes University of Swat from University of Shangla.
- No private portal data, student records or credentials are exposed or implied.
- Retrieval does not return only a broad overview when a specific policy or dated notice is required.


## Version 2.1 structured evaluation

A machine-readable expanded test set is available at `metadata/rag-evaluation-set.json`. It preserves the original ten scenarios and adds Urdu, Roman Urdu, prompt-injection, privacy-boundary, calendar-freshness and multi-source distinction tests. This is a test specification, not a completed runtime evaluation.
