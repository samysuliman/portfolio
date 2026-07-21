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

## 5.2 — Rule-based automatic preparation
- Added one-click article preparation without external AI or subscriptions.
- Detects the most suitable series from article content using local rules.
- Generates an initial title, summary, keywords and image alt text.
- Creates a main cover image from one fixed branded template.
- Changes symbolic background by topic: Seerah, faith, education, leadership, business or professional experience.
- Added a button to regenerate the symbolic background while keeping the same template.

## 5.3 — Smart Publishing Studio
- Rebuilt the publisher interface around two visible inputs: article title and article content.
- Renamed the primary action to **✨ أنشئ المقال**.
- Added staged creation messages while the local rule engine prepares the article.
- Added a focused review card with generated cover, series, summary, keywords, preview, and publish actions.
- Moved translation, SEO, scheduling, media, and quality controls into a collapsible advanced section.
- No AI subscription or external backend is required.
## Stage 5 — Content Intelligence Engine (v5.4)
- Added a local rule-based Content Intelligence Engine with no paid AI dependency.
- Extracts and stores: main idea, golden quote, category, tone, target audience, and key lessons.
- Added a visible “فهم المقال” review card after article generation.
- Saved intelligence output inside each article record as `contentIntelligence`.
- Existing articles are analyzed automatically when opened for editing.

