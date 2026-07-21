# Article System Changelog

## 5.0 — Clean Start (Stage 1)

- Removed all public sample/published articles.
- Removed the accidental duplicate `articles-data (1).js`.
- Introduced article schema version 2.
- Unified Arabic and English content in one normalized record.
- Added safe parsing and storage error handling.
- Moved browser storage to `samy_articles_v2`.
- Added a one-time cleanup of old article storage keys so old phone/desktop drafts do not reappear.
- Bumped article asset versions and the service-worker cache.
- Added `articles/articles-data.js` to the application cache list.

This stage intentionally does not add the smart-analysis UI; that belongs to Stage 2.

## Stage 2 — Publisher Pro (v5.1)
- Added live article quality score (0–100).
- Added word count, character count, and estimated reading time.
- Added live SEO/content completeness checks.
- Added inline validation instead of alert-only required-field errors.
- Added article-card preview modal before publishing.
- Added visible last-save date and time.
- Updated article asset cache versions to 5.1.
