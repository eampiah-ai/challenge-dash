# Tasks

## 1. Project scaffolding and version control

- [x] 1.1 Initialize a Next.js 15 project with TypeScript, Tailwind CSS, ESLint, App Router, and the `@/*` import alias, then verify `npm run dev` starts without errors.
- [x] 1.2 Initialize git in the repository root, add a `.gitignore` for Node.js/Next.js/Prisma/environment files, and verify `git status` shows only intended untracked files.
- [x] 1.3 Install runtime and dev dependencies (`prisma`, `@prisma/client`, `bcryptjs`, `iron-session`, `@types/bcryptjs`) and verify `npm install` completes with no peer-dependency errors.
- [x] 1.4 Add `src/lib/prisma.ts` as a singleton Prisma client and verify it imports cleanly in a test script.

## 2. Database schema and seed data

- [x] 2.1 Define the Prisma schema with `Challenge`, `Participant` (including a `timezone` field defaulting to `America/Chicago`), `DailyLog`, `WeeklyLog`, `BiWeeklyLog`, `MonthlyLog`, and `SundayResetLog` models, then run `npx prisma generate` successfully.
- [x] 2.2 Run the initial migration with `npx prisma migrate dev --name init` and verify the migration applies to the local database.
- [x] 2.3 Create `prisma/seed.ts` to insert the challenge definition and a bcrypt-hashed shared group password, then verify `npx prisma db seed` populates the database.
- [x] 2.4 Add `.env.example` with `DATABASE_URL`, `SESSION_SECRET`, and `GROUP_PASSWORD` placeholders and verify it documents required values.

## 3. Authentication and session

- [x] 3.1 Implement `src/lib/session.ts` with `iron-session` to create, read, and destroy an encrypted session cookie containing `participantId` and `participantName`, and verify the cookie is set on login.
- [x] 3.2 Implement `POST /api/auth/login` to validate the shared group password with bcrypt, create or fetch a `Participant`, detect and store the browser timezone for new participants, and establish a session; verify it rejects invalid passwords.
- [x] 3.3 Implement `POST /api/auth/logout` to destroy the session and verify the cookie is cleared.
- [x] 3.4 Add `src/middleware.ts` to redirect unauthenticated users from protected routes to `/login` and verify protected pages require a session.
- [x] 3.5 Add a timezone mismatch prompt on login that asks returning participants whether a detected timezone change is temporary travel or a permanent home-timezone update; verify both choices update the session correctly and only "Update" changes the stored timezone.

## 4. Progress logging pages and API

- [x] 4.1 Implement `POST /api/progress` to upsert daily, weekly, bi-weekly, monthly, and Sunday-reset logs for the authenticated participant, and verify it rejects dates outside the challenge window.
- [x] 4.2 Build `src/app/entry/page.tsx` with a date picker defaulting to the participant's local today based on their stored timezone, and toggles for all daily habits, verifying the form submits to `/api/progress`.
- [x] 4.3 Add weekly habit fields to the entry page, shown conditionally or visually highlighted based on the current week, and verify savings and project/hobby minutes are saved.
- [x] 4.4 Add bi-weekly allowance fields to the entry page, enforce a single alcohol and single sweet allowance per two-week period, and verify the API rejects excess entries.
- [x] 4.5 Add monthly fast and Sunday reset fields to the entry page, verify the API rejects Sunday reset on non-Sundays, and verify the monthly fast records on the last day of the month.

## 5. Group dashboard

- [x] 5.1 Implement `GET /api/dashboard` to return all participants with timezone-aware completion percentages, current streaks, and recent activity, and verify it only reads data (no mutations).
- [x] 5.2 Build `src/app/dashboard/page.tsx` to display participant cards with overall completion rate and a breakdown by habit type, and verify it renders without errors.
- [x] 5.3 Add timezone-aware streak and recent-activity sections to the dashboard and verify they update after progress is logged.
- [x] 5.4 Ensure the dashboard is accessible only to authenticated users and verify unauthenticated requests are redirected to login.

## 6. Login page and navigation

- [x] 6.1 Build `src/app/login/page.tsx` with display name and shared password fields, integrate with the login API, and verify successful login redirects to the dashboard.
- [x] 6.2 Add a logout button and navigation links between the dashboard and entry page, and verify navigation works across sessions.

## 7. Verification, build, and documentation

- [x] 7.1 Run `npm run lint` and fix all reported issues, verifying a clean lint run.
- [x] 7.2 Run `npm run build` successfully and verify the production build starts with `npm start`.
- [x] 7.3 Perform an end-to-end smoke test: register as a participant, log daily/weekly/bi-weekly/monthly/Sunday-reset progress, and view the updated dashboard.
- [x] 7.4 Write a `README.md` with setup, environment, and deployment instructions, and verify the documented commands run as written.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Deploy to Vercel with the Supabase/Neon connection string and verify the live application.
- Push the repository to the remote GitHub origin.
