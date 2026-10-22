# ADR 0002: Use expo-sqlite for local storage

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

DuesUp v1 is local-first: all data lives on the device and the app works fully offline. v1.1 adds cloud sync for paid users, so the local store will need to track which records changed and support soft deletes.

The data is relational and small: subscriptions, categories, and later price-change history. The app needs to sort and filter it, for example listing subscriptions by next renewal date, and calculate totals.

Options considered:

1. **AsyncStorage** — a simple key-value store. Easy to start with, but everything is stored as JSON blobs, so sorting, filtering and partial updates happen in JavaScript, and there are no schema migrations.
2. **expo-sqlite** — a real SQLite database maintained by Expo. Supports SQL queries, indexes, transactions and versioned migrations, and works in Expo Go.
3. **WatermelonDB / Realm** — full-featured databases with built-in sync models, but they add a native dependency and a framework-specific way of modelling data, which is more than v1 needs.

## Decision

Use **expo-sqlite** as the local database.

Schema changes are applied through numbered migrations tracked with SQLite's `user_version`. Domain logic, such as renewal dates and totals, stays in plain TypeScript functions in `src/domain` and does not depend on the database.

## Consequences

**Positive**
- Proper queries, indexes and transactions for sorting by renewal date and calculating totals
- Versioned migrations make schema changes safe for existing users
- Works in Expo Go, so no development build is needed yet
- A natural fit for v1.1 sync: sync fields such as `updatedAt` and `deletedAt` are simple columns, and changed rows can be found with a query
- SQL and schema design experience transfers directly to the Supabase (Postgres) backend

**Negative**
- More setup than AsyncStorage: a schema, migrations and a small data-access layer
- Hand-written SQL needs its own tests and careful mapping to TypeScript types

**Follow-ups**
- Add sync columns (`deletedAt`, sync state) in the v1.1 migration rather than up front, since v1 has no sync
