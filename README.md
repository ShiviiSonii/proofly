# Proofly — Testimonial Management System

Automated testimonial collection and management system built with Next.js, Prisma, and Supabase.

## Tech Stack

- **Next.js 16** — React framework with App Router
- **Prisma** — Type-safe ORM for database queries
- **Supabase** — PostgreSQL database hosting
- **NextAuth.js v5** — Authentication (email/password)
- **Tailwind CSS** — Styling
- **TypeScript** — Type safety

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database**
3. Copy your **Connection string** (use the "URI" format)
4. Copy your **Direct connection** string (for migrations)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Database (from Settings → Database)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Secret (generate a random string)
AUTH_SECRET="your-random-secret-here"
AUTH_URL="http://localhost:3000"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up Database Schema

```bash
npx prisma db push
```

This creates the `User` table in your Supabase database.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
proofly/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── api/auth/          # Auth API routes
│   └── dashboard/         # Protected dashboard
├── components/            # React components
├── lib/                   # Utilities (Prisma client)
├── prisma/                # Database schema
└── auth.ts               # NextAuth configuration
```

## Features

- ✅ Email/password authentication
- ✅ Protected routes (middleware)
- ✅ Secure password hashing (bcrypt)
- ✅ JWT session management
- ✅ Type-safe database queries (Prisma)

## Database

The project uses **Supabase** (PostgreSQL) for data storage. All database operations go through Prisma for type safety and easy migrations.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
