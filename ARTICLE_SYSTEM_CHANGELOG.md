# Article System Changelog

## Stage 1 — Clean start and data foundation

- Removed all public/demo articles.
- Removed duplicate `articles-data (1).js`.
- Introduced article schema version 2.
- Moved browser storage to `samy_articles_v2`.
- Added one-time removal of legacy article stores from phones and computers.
- Added safe storage handling and corrupted-data fallback.
- Kept Arabic and English in one article record.
- Bumped article assets and service-worker cache to version 5.0.
