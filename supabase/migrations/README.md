# Migrations

**The authority is the database**, not this directory:

```sql
select version, name from supabase_migrations.schema_migrations order by version;
```

These files are the reproducible record — running them in order against an empty
database must produce the live schema. If you change one, change the database
too, and vice versa. A file that no longer reproduces the database is worse than
no file, because it will be trusted.

| # | Applied as | Notes |
|---|---|---|
| 0001 | `layer0_foundation_schema` | 17 tables, 9 enums, 13 policies, 37 indexes. Includes the `rls_auto_enable()` revoke, which was applied directly rather than as a recorded migration — it is in the file so a fresh database reproduces it |
| 0002 | `navigation_unique_location_route` | Makes the seed idempotent |
| 0003 | `seed_site_chrome` | Applied as two migrations, `seed_settings_and_navigation` and `seed_ui_strings` |
| 0004 | `seed_settings_values` | name / email / linkedin_url |

Applied with the Supabase MCP `apply_migration`. Content migrations stop at site
chrome: case files, chapters and their copy arrive through
`scripts/sync-notion.ts` from Notion, never as SQL (decision 021).
