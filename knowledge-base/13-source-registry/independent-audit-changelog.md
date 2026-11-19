---
title: "Independent Audit Change Log"
category: "Source Registry"
source_type: "Audit Record"
source_urls:
  - "https://uswat.edu.pk/about-university/"
  - "https://uswat.edu.pk/maincampus/"
  - "https://uswat.edu.pk/women-campus/"
  - "https://uswat.edu.pk/faculty/"
  - "https://www.hec.gov.pk/english/universities/Pages/KPK/University-of-Swat.aspx"
  - "https://www.hec.gov.pk/english/universities/Pages/DAIs/HEC-recognized-Campuses.aspx"
  - "https://kpcode.kp.gov.pk/homepage/lawDetails/1260"
document_date: null
accessed_date: "2026-11-18"
academic_session: null
verification_status: "verified"
last_verified_date: null
valid_from: null
valid_until: null
source_authority: "See source_urls and Sources section"
is_time_sensitive: false
source_keys: [about, maincampus, womencampus, alliedhealth, hec_profile, hec_campuses, kpcode_reg]
---
# Independent Audit Change Log

## Knowledge Base v2 reconciliation

- Reconciled `campuses.md` with `campus-status.md`; removed the obsolete claim that the Main and Women Campus pages were not retrieved.
- Updated the campus overview to distinguish university-published campus information from HEC recognition validity dates.
- Replaced the stale Shangla uncertainty statement with the HEC-reported upgrade to the University of Shangla effective 1 August 2022.
- Rewrote `research-gaps.md` to distinguish resolved documentation gaps from genuinely unresolved content.
- Updated `metadata/research-summary.md` and regenerated the manifest from the actual Markdown files.
- Added `rag-evaluation-test-set.md` for supported-answer, caveat and abstention testing.
- Added temporal/provenance front-matter fields where missing; unknown dates remain null.


## What was done

The original Claude-produced archive was inspected, including its Markdown files, JSON metadata, research summary and gaps report. An independent web verification pass was then conducted using official University of Swat pages, HEC pages and the Khyber Pakhtunkhwa legal database.

## Files added

- `00-university-overview/vision-mission-values.md`
- `00-university-overview/legal-status-and-recognition.md`
- `00-university-overview/campus-status.md`
- `02-academics/faculty-of-allied-health-sciences.md`
- `04-student-services/official-digital-services.md`
- `13-source-registry/independent-audit-changelog.md`

## Files updated

- `README.md`
- `00-university-overview/university-profile.md`
- `00-university-overview/history.md`
- `00-university-overview/campuses.md`
- `02-academics/departments.md`
- `04-student-services/student-services-overview.md`
- `13-source-registry/research-gaps.md`
- `metadata/research-summary.md`
- `metadata/source-registry.json`
- `metadata/knowledge-base-manifest.json`

## Important corrections and caveats

1. Vision, mission, core values and objectives were retrieved from the official About page and added.
2. The university's Main Campus page identifies Charbagh. The HEC profile separately displays G.T. Road, Odigram as contact information; these addresses were not merged.
3. The Women Campus page remains published by the university, but HEC's recognised-campuses page displays a validity period ending 30 September 2025. Current recognition status is flagged for confirmation.
4. HEC states that Shangla was upgraded to the University of Shangla with effect from 1 August 2022. It is not presented as a current University of Swat campus.
5. The official Main Campus, Women Campus and Faculty of Allied Health Sciences pages publish different departmental groupings. A single definitive total is not asserted.
6. The University of Swat Regulation, 2010 is linked from the Khyber Pakhtunkhwa government legal database.
7. The CMS service list is treated as a description of public portal functionality, not permission to access personal or restricted records.

## Remaining limitations

This update does not complete the missing admission prospectus, current programme-by-programme availability, tuition fee schedule, full academic regulations, OCR of scanned PDFs, full faculty directory, all department profiles or current office-holder directory. See `research-gaps.md`.

## Sources

See the source registry and the source sections in each updated document.


## 2026-11-18 — Knowledge Base v2.1 preparation

- Standardized `potentially_outdated` in machine-readable manifest/front matter.
- Expanded canonical verification-status definitions.
- Added source keys only where front-matter source URLs exactly match registered URLs; unresolved mappings were not guessed.
- Added `metadata/chunk-preview.json` and `metadata/rag-evaluation-set.json` (16 test cases).
- Updated README and research summary with limitations.
- No fresh source crawl or re-verification was performed in this update.
