---
title: "Source Verification and Status Rules"
category: "Source Registry"
source_type: "Internal documentation"
source_urls: []
document_date: null
accessed_date: "2026-11-18"
academic_session: null
verification_status: documentation
last_verified_date: null
source_authority: "Knowledge-base governance documentation"
is_time_sensitive: false
valid_from: null
valid_until: null
---

# Source Verification and Status Rules

This document defines machine-readable statuses used by the knowledge base. A status describes the evidence available at capture; it is not a guarantee that a fact remains current.

## Canonical `verification_status` values

| Value | Meaning | Current-answer handling |
|---|---|---|
| `verified` | The cited source supported the recorded statement at the recorded capture date. | May be used, subject to time-sensitivity and validity checks. |
| `verified_with_caveats` | Evidence supports the statement, but an explicit limitation or qualification applies. | Include the caveat in the answer. |
| `historical` | The record is intentionally retained as historical information. | Use only for historical questions or clearly date it. |
| `potentially_outdated` | The information may have changed since capture or its effective period is unclear. | Do not present as current without re-checking an authoritative source. |
| `unverified` | The claim has not been confirmed by adequate authoritative evidence. | Do not assert as fact; abstain or explain the gap. |
| `not_found` | The information was not located in the collected sources. | Treat as a research gap, not proof that the information does not exist. |
| `documentation` | The file describes project methodology, metadata, or QA rather than university facts. | Exclude from factual answer retrieval unless the user asks about KB methodology. |

Use underscores exactly as shown. Do not use spaces or alternate spellings in machine-readable metadata.

## Date fields

- `accessed_date`: date a source was accessed. It does not mean every statement was independently re-verified that day.
- `last_verified_date`: date the specific factual content was checked against its source. Leave `null` when not known.
- `document_date`: date printed or formally issued on the source, if known. Do not infer from a URL path alone.
- `academic_session`: session to which the record applies, if explicitly stated.
- `valid_from` / `valid_until`: explicit effective dates, not inferred dates.

## Source mapping

`source_keys` must reference keys in `metadata/source-registry.json`. Map keys only when the document's cited URL matches a registry URL or a human reviewer has explicitly confirmed the relationship. Do not assign a plausible-looking source key based only on a filename or topic. A factual document with no confirmed source mapping must be flagged for manual review.

## Source authority

Keep official University of Swat pages and documents distinct from HEC/government records and third-party websites. Third-party sources may help discover information but must not silently override official sources.

## Time-sensitive topics

Admissions, deadlines, fees, scholarships, calendars, jobs, announcements, office holders, contact details, campus recognition and service availability require a current-source check before being presented as current. Historical information may remain retrievable for explicitly historical questions.
