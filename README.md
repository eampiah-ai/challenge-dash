# Challenge Dash

A lightweight, professional dashboard for tracking a friendly 3-month self-improvement challenge. Participants log in with a shared group password, record daily and periodic progress, and view each other's progress in a shared group dashboard.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/) + PostgreSQL
- [iron-session](https://github.com/vvo/iron-session) for encrypted session cookies
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing

## Local Development

### 1. Start PostgreSQL

The easiest way is with Docker:

```bash
docker run --name challenge-dash-db \
  -e POSTGRES_USER=challenge \
  -e POSTGRES_PASSWORD=challenge \
  -e POSTGRES_DB=challenge \
  -p 5434:5432 \
  -d postgres:16
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set a strong `SESSION_SECRET` and a `GROUP_PASSWORD` for seeding.

### 3. Install dependencies

```bash
npm install
```

### 4. Set up the database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any display name and the seeded group password.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the challenge and shared password |
| `npm run db:studio` | Open Prisma Studio |

## Deployment

### Vercel + Supabase/Neon

1. Push this repository to GitHub.
2. Create a new project on [Vercel](https://vercel.com/) and import the repository.
3. Create a free PostgreSQL database on [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).
4. Add the following environment variables in Vercel:
   - `DATABASE_URL` — your Postgres connection string
   - `SESSION_SECRET` — a strong random secret (at least 32 characters)
   - `GROUP_PASSWORD` — the shared group password used to seed the challenge
5. Run the seed command once via the Vercel CLI or a one-off function:
   ```bash
   npx prisma db seed
   ```
6. Redeploy if needed.

## Timezone Behavior

- Each participant's timezone is detected from the browser at first login and stored as their "home" timezone.
- If a later login detects a different timezone, the user is asked whether they are temporarily traveling or want to update their home timezone.
- Daily streaks, due dates, and period boundaries are computed using the stored home timezone.
- Users can manually select a date when logging progress, which is useful when traveling or catching up.

## Project Structure

```
challenge-dash/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script for challenge + shared password
├── src/
│   ├── app/               # Next.js App Router pages and API routes
│   ├── components/        # React components
│   ├── lib/
│   │   ├── dates.ts       # Timezone-aware date helpers
│   │   ├── prisma.ts      # Prisma client singleton
│   │   └── session.ts     # iron-session utilities
│   └── middleware.ts      # Auth route protection
├── .env.example           # Example environment variables
└── README.md
```

## Challenge Rules

The dashboard supports the checklist described in the project brief:

- **Daily:** steps, workout, prayer/meditation, water, eat at home, learn/read, podcast
- **Weekly:** savings, project/hobby time
- **Bi-weekly:** alcohol and sweet allowances
- **Monthly:** fast on the last day of the month
- **Sunday Reset:** plan workouts, meals, savings, top 3 goals, and progress review
