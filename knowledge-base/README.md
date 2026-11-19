# University of Swat Knowledge Base — v2.1

AI-ready Markdown knowledge base for the University of Swat, Pakistan, assembled from the official university website and cited official documents, with HEC and government records kept distinguishable. **Capture/audit date: 2026-11-18. This is a research snapshot, not an exhaustive or live source.**

## What changed in v2.1

- Standardized the machine-readable status `potentially_outdated` and expanded the status definitions.
- Added source-key mappings only where explicit source URLs match the source registry; unresolved mappings remain visible for manual review.
- Added `metadata/chunk-preview.json` with heading-aware, paragraph/table-preserving chunk previews and metadata.
- Added `metadata/rag-evaluation-set.json` with 16 structured evaluation cases, including Urdu, Roman Urdu, privacy boundaries and prompt-injection resistance.
- Updated manifest metadata and declared an initial chunking profile (500-token target, 800-token maximum, 80-token overlap recommendation). Token counts in the preview are approximate and must be replaced with the selected model tokenizer before production ingestion.

## What changed in v2

- Reconciled the campus overview with the separate campus-status file.
- Removed obsolete statements that Main/Women Campus and About-page vision/mission content were unavailable.
- Recorded the HEC-reported Shangla upgrade and the Women Campus recognition-date caveat without asserting current renewal.
- Rewrote the research gaps and corrected the archive counts.
- Added a RAG evaluation test set covering supported answers, partial answers and required abstentions.
- Updated the manifest and introduced explicit temporal/provenance metadata.

## Contents

| Folder | Purpose |
|---|---|
| `00-university-overview` | Profile, history, leadership, vision/mission/values, legal status and campuses |
| `01-admissions` | Admissions contacts, fee snapshot, scholarships and deadline status |
| `02-academics` | Faculties, departments, academic calendar and semester system |
| `03-departments-and-faculty` | Department contact directory |
| `04-student-services` | Public service and portal descriptions |
| `05-administration` | Offices and contact directory |
| `06-research-and-development` | ORIC references |
| `07-policies-and-regulations` | Regulations and policy index |
| `08-news-and-announcements` | Dated news snapshot |
| `09-careers-and-opportunities` | Dated job snapshot |
| `11-downloads-and-official-documents` | Official document inventory and forms |
| `12-contacts-and-faqs` | General contacts and FAQs |
| `13-source-registry` | Sources, verification, research gaps, audit log and RAG tests |
| `metadata` | Manifest, categories, source registry and research summary |

## Start here

1. Read `13-source-registry/research-gaps.md` before using the knowledge base.
2. Read `13-source-registry/source-verification.md` for source and status conventions.
3. Use `metadata/knowledge-base-manifest.json` to enumerate content files and metadata.
4. Use `13-source-registry/rag-evaluation-test-set.md` to test retrieval and abstention.

## Verification and temporal metadata

Existing `verification_status` values are retained. V2 adds or recommends these fields in Markdown front matter and RAG chunk metadata: `last_verified_date`, `valid_from`, `valid_until`, `source_authority`, and `is_time_sensitive`. Missing values must remain null/unknown; do not infer dates.

Status meanings: `verified` means the cited source supported the recorded statement at capture; `verified_with_caveats` means the fact is supported but has an important limitation; `historical` means it should not be presented as current; `potentially outdated` means re-check before current use; `unverified` means not confirmed; `not found` means not located in the collected sources.

## Critical chatbot rules

- Never invent deadlines, fees, eligibility criteria, programmes, contact details or recognition status.
- Treat fees, deadlines, calendars, scholarships, jobs, news, office holders and campus recognition as time-sensitive.
- Distinguish University of Swat from University of Shangla.
- Keep Main Campus (Charbagh) separate from the HEC profile's Odigram contact address.
- The HEC Women Campus entry displays a validity period ending 2025-09-30; current renewal is not confirmed by this archive.
- If the retrieved material does not support an answer, say so and direct the user to the relevant official source.
- Do not ingest credentials, private student records or restricted portal content.

## RAG preparation

1. Parse front matter into chunk metadata.
2. Split Markdown by meaningful headings; keep tables and their captions/headers together.
3. Preserve each chunk's source URLs, file path, heading, status and temporal fields.
4. Filter or down-rank `unverified`, `historical` and `potentially outdated` chunks for current questions. Do not simply delete them if historical questions are supported.
5. Require the answer to cite retrieved sources, state dates for time-sensitive claims and abstain when current evidence is missing.
6. Evaluate with `13-source-registry/rag-evaluation-test-set.md` before deployment.

## Updating the knowledge base

Re-open the source URLs in `metadata/source-registry.json`, compare the new content with the existing record, update the relevant Markdown file and its verification/temporal metadata, regenerate the manifest, and add an entry to the audit changelog. Never change an old fact to a new value without retaining the source context and date.


## v2.1 limitations and manual review

- This update is a structural/RAG-preparation pass over the existing v2 archive; it is not a fresh crawl or re-verification of university sources.
- Source mappings are added only from explicit front-matter URLs that exactly match the source registry. Documents with no confirmed source mapping remain unmapped; do not guess.
- `metadata/chunk-preview.json` is a preview. Validate chunk boundaries, token counts and retrieval quality using the actual embedding model before database ingestion.
- The expanded evaluation set defines expected behaviour; no live retrieval or answer-quality score is claimed.
- Time-sensitive facts (fees, deadlines, calendars, scholarships, jobs, announcements and recognition status) still require current-source verification.
