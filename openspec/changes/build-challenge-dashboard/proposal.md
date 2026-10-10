# Proposal

## Why

A group of friends wants a lightweight, engaging way to track a shared 3-month self-improvement challenge. Existing tools are either too generic or too complicated; a custom dashboard lets everyone log daily habits, see each other's progress, and stay motivated without friction.

## What Changes

- Initialize a fresh Next.js 15 project in the current repository with TypeScript, Tailwind CSS, and shadcn/ui.
- Add Prisma with a PostgreSQL database (Supabase or Neon free tier) for persistence.
- Implement simple group authentication: display name + single shared group password stored as a bcrypt hash.
- Create a session cookie so users stay logged in across visits.
- Build a daily progress entry page for the challenge checklist (daily, weekly, bi-weekly, monthly, and Sunday-reset items).
- Build a group dashboard where all participants can view each other's completion rates, streaks, and recent activity.
- Seed the database with the challenge definition and shared password.
- Configure git, `.gitignore`, and project documentation so the repo is ready to push to GitHub and deploy to Vercel.

## Capabilities

### New Capabilities

- `challenge-progress-tracking`: Participants can log progress against daily, weekly, bi-weekly, monthly, and Sunday-reset checklist items for the current 3-month challenge.
- `group-auth-session`: Participants authenticate with a display name and shared group password, and remain logged in via an encrypted session cookie.
- `group-dashboard`: All authenticated participants can view a shared dashboard showing each participant's completion rates, streaks, and recent entries.

### Modified Capabilities

- None.

## Impact

- New Next.js application in the repository root.
- New Prisma schema and migration files.
- New environment variables: `DATABASE_URL`, `SESSION_SECRET`, and `GROUP_PASSWORD` (or hashed seed value).
- Deployment target: Vercel with a Supabase/Neon PostgreSQL database.
