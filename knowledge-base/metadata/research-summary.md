# Research Summary — Knowledge Base v2

**Capture/audit date:** 2026-11-18 | **Scope:** University of Swat, Pakistan (`https://uswat.edu.pk/`) | **Version:** 2.0 | **Status:** reconciled documentation; not exhaustive

## Overall summary

Version 2 reconciles outdated campus and research-gap statements, makes the Women Campus recognition caveat explicit, records Shangla's HEC-reported upgrade, updates the research coverage report, and adds a reusable RAG evaluation test set. It does not claim that missing university information has been discovered or that every source URL was freshly re-crawled during this documentation pass.

The knowledge base includes university profile/history, vision/mission/values, legal status, campus context, faculties/departments, admissions snapshots, fees and scholarship material, academic/regulatory references, student services, administration, contacts, news/jobs snapshots and source registries.

## Archive contents

| Measure | Count |
|---|---:|
| Markdown files (including README and research summary) | 41 |
| JSON files | 3 |
| Markdown files in content folders (excluding root README and this summary) | 39 |
| Teaching-department entries reported in the source navigation | 24 (not a definitive reconciled total) |

Counts are generated from the v2 folder contents, not copied from the earlier summary.

## Reconciliation performed in v2

- Rewrote `00-university-overview/campuses.md` to align with `campus-status.md`; removed the obsolete claim that the Main and Women Campus pages had not been retrieved.
- Replaced the old Shangla “unverified” status with the HEC-reported upgrade to the University of Shangla effective 1 August 2022.
- Preserved the Women Campus HEC validity end date of 30 September 2025 and explicitly left current renewal unconfirmed.
- Rewrote `13-source-registry/research-gaps.md` so it no longer says the About-page vision/mission content is inaccessible or the campus pages are wholly unretrieved.
- Replaced stale file counts and coverage statements from the earlier summary.
- Added `13-source-registry/rag-evaluation-test-set.md` with expected answers, abstention behaviours and retrieval checks.
- Updated the manifest and metadata to carry explicit temporal/provenance fields.

## Key caveats retained

- Current admission deadline and programme-specific eligibility are not verified.
- The available fee schedule is a historical/possibly superseded snapshot, not a current fee quote.
- The newest academic calendar in the collected material is from 2024.
- Women Campus current HEC recognition/renewal is not confirmed by the listed validity period ending 30 September 2025.
- Shangla was upgraded to the University of Shangla effective 1 August 2022 according to HEC.
- Department counts/groupings vary across source pages; do not present 24 as a definitive current total.
- Scanned semester regulations and the remaining Statutes pages require further extraction and review.

## Source limitations

This archive records official university, HEC and government sources. Some website content is dynamic or tabbed; some PDFs are scanned; some links were discovered but not opened; and some source pages may have changed since the capture date. See `13-source-registry/research-gaps.md` and `13-source-registry/source-verification.md`.

## Recommended next collection cycle

1. Retrieve the latest official admission advertisement and prospectus.
2. Obtain current approved fee schedules and programme-wise fee information.
3. Confirm Women Campus recognition status with HEC or a current university notification.
4. Build a verified programme catalogue with eligibility and degree details.
5. OCR scanned regulations and complete the Statutes review.
6. Capture current academic calendar, department pages, faculty profiles and office-holder details.
7. Re-check source links and update `accessed_date`, verification status and manifest entries.


## v2.1 RAG preparation update (2026-11-18)

This archive adds consistent machine-readable verification-status vocabulary, explicit source-key mapping where source URLs match the registry, a chunk preview, and a structured 16-case evaluation specification. This is a metadata and preparation update only; it does not constitute a fresh crawl, current fact verification, live RAG test, or database ingestion. Unmapped source relationships and null verification dates must remain unresolved until manually confirmed.
