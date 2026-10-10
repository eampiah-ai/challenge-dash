# Design

## Context

The repository is currently an empty OpenSpec project. The goal is to build a single, self-contained web application for a friendly 3-month challenge. See `proposal.md` for the motivation and scope. The application will be used by a small group of friends, so the auth model can be intentionally lightweight while the UI should feel polished and professional.

## Goals / Non-Goals

**Goals:**
- Provide a fast, mobile-friendly way to log daily and periodic challenge progress.
- Display group progress in a way that feels encouraging, not overly competitive.
- Keep the deployment path simple and low-cost (Vercel + free-tier Postgres).
- Structure the code so future challenges or per-user accounts can be added without rewriting the core.

**Non-Goals:**
- Real-time updates or push notifications.
- Per-user password recovery or email verification.
- Native mobile app or offline support beyond normal browser caching.
- Analytics beyond the current challenge window.

## Decisions

### Next.js 15 App Router + TypeScript
- **Rationale**: One codebase for routing, API routes, and rendering. App Router simplifies server components and API co-location. TypeScript keeps the data model explicit.
- **Alternatives considered**: React SPA + Express backend (more moving parts); vanilla HTML (too limited for the dashboard). Next.js is the best balance of simplicity and capability.

### Tailwind CSS + shadcn/ui
- **Rationale**: Tailwind gives fast, consistent styling without writing custom CSS. shadcn/ui provides accessible, composable components that look professional out of the box.
- **Alternatives considered**: CSS Modules or Styled Components (more manual work); Material UI (heavier, less flexible).

### PostgreSQL via Supabase/Neon + Prisma
- **Rationale**: Serverless-friendly Postgres avoids filesystem persistence issues on Vercel. Prisma provides type-safe queries and migrations. The free tier is more than enough for a small group over 3 months.
- **Alternatives considered**: SQLite file with better-sqlite3 (simpler locally but problematic on Vercel's ephemeral filesystem); MongoDB (less relational for this structured data).

### Shared group password with bcrypt + iron-session
- **Rationale**: Removes the need for email, sign-up, or password reset flows. The group password is hashed with bcrypt. `iron-session` provides encrypted, stateless session cookies without a separate session store.
- **Alternatives considered**: Magic links (requires email service); NextAuth.js (overkill for a single shared password); plain cookie (not secure enough).

### Normalized log tables per cadence
- **Rationale**: Daily, weekly, bi-weekly, monthly, and Sunday-reset items have different frequencies and validation rules. Separate tables make constraints natural (e.g., unique `(participantId, date)` for daily logs) and queries simple.
- **Alternatives considered**: Single JSONB `logs` table (flexible but loses type safety and simple constraints).

### Participant timezone detected at login and stored as home timezone
- **Rationale**: Each daily log belongs to a specific day the participant chooses, not a server UTC day. At first login the browser's timezone is captured and stored as the participant's "home" timezone. If a later login detects a different timezone, the UI asks whether the participant is temporarily traveling or wants to update their home timezone. Streaks and period boundaries are computed against the stored home timezone.
- **Alternatives considered**: UTC for all server-side dates (degrades experience near local midnight); hardcoding `America/Chicago` (breaks if participants join from elsewhere); always using the browser's current timezone (breaks streaks when traveling).

## Risks / Trade-offs

- **Shared password leakage** → Mitigation: store only the bcrypt hash; regenerate the password and re-hash if the group composition changes.
- **Free-tier database limits** → Mitigation: data volume is tiny for this use case; monitor usage and upgrade only if needed.
- **Vercel hobby cold starts** → Mitigation: negligible impact for a low-traffic dashboard; consider Pro only if traffic grows.
- **No offline support** → Mitigation: acceptable for a home-use dashboard; can add service worker later.
- **Timezone edge cases when traveling** → Mitigation: the user explicitly selects the day, and a detected timezone mismatch prompts for temporary travel or permanent home-timezone update.

## Migration Plan

1. Create the Next.js project and commit the initial scaffold to git.
2. Add Prisma schema with participant timezone and local-date fields, run initial migration against a local or preview database.
3. Implement auth and session handling; detect and store the browser timezone as the participant's home timezone at login.
4. Implement progress logging and dashboard pages.
5. Add seed script and `.env.example`.
6. Verify with local build, lint, and typecheck.
7. Create a Vercel project, add environment variables, and deploy.
8. Push the repository to GitHub and connect Vercel to it.

## Open Questions

- Exact challenge start and end dates (can default to the current or next 3-month window).
- Whether to show weekly/bi-weekly/monthly/Sunday-reset forms only on their due days or always available with due-day hints (recommendation: available any time, with visual cues for due items).
