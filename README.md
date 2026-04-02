# TicketAI — AI-Powered Customer Ticket Management

A production-quality, full-stack AI-powered customer support ticket management web application with intelligent ticket classification, role-based access control, and real-time analytics dashboards.

> *Add screenshots here*

---

## Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Framework        | Next.js 14 (App Router)              |
| Language         | TypeScript (strict mode, zero `any`) |
| Styling          | Tailwind CSS + shadcn/ui             |
| Database         | PostgreSQL 16                        |
| ORM              | Prisma ORM                           |
| Authentication   | NextAuth.js v4 (JWT + Credentials)   |
| AI               | Google Gemini API (gemini-2.0-flash) |
| Validation       | Zod (client + server)                |
| Charts           | Recharts                             |
| Containerization | Docker + Docker Compose              |

---

## Key Features

### AI-Powered Ticket Classification
- When a customer submits a ticket, Google Gemini AI automatically:
  - **Categorizes** the ticket (Billing, Technical Support, Bug Report, Feature Request, General Inquiry, Account Issue)
  - **Assigns priority** (Low, Medium, High, Urgent)
  - **Generates a summary** (1-2 sentence overview)
- AI classification is non-blocking — if the API fails, the ticket is still created with default values
- Admins and agents can override AI suggestions manually

### User Management with Role-Based Access
- **Three roles**: Admin, Agent, Customer — each with a dedicated portal
- Customers can self-register; Admins can create users with any role
- Password security with bcrypt hashing
- Soft-delete (deactivate) users instead of hard delete
- Route protection via NextAuth.js middleware — users are redirected to their role-specific dashboard

### Admin Portal (`/admin`)
- **Dashboard**: Stat cards + 3 interactive charts (Pie: tickets by category, Line: tickets over time, Bar: tickets by priority)
- **Ticket Management**: View all tickets, filter by status/priority/category, search, assign agents, override AI classification
- **User Management**: Create/edit/deactivate users, assign roles, view user stats

### Agent Portal (`/agent`)
- **Dashboard**: Stats for assigned tickets only
- **Ticket Management**: View assigned tickets, update status (Open → In Progress → Resolved → Closed)
- **Comments**: Add public replies (visible to customer) and internal notes (visible only to agents/admins)
- **Activity Log**: Full ticket lifecycle history

### Customer Portal (`/customer`)
- **Dashboard**: Personal ticket stats with quick actions
- **Create Ticket**: Form with validation, character counts, attachment UI (placeholder)
- **My Tickets**: Paginated list with search and status filter
- **Ticket Detail**: View AI classification badges, comment thread, activity timeline

### Additional Features
- **Dark Mode** — Toggle between light/dark themes (system-aware)
- **Responsive Design** — Works on mobile, tablet, and desktop with collapsible sidebar
- **Input Validation** — Zod schemas on both client-side forms and server-side API routes
- **Toast Notifications** — Success/error feedback for all user actions
- **Loading Skeletons** — Smooth loading states (not just spinners)
- **Empty States** — Helpful messages when no data exists
- **Confirmation Dialogs** — Before destructive actions (delete, deactivate)
- **Activity Logging** — Every ticket action is recorded with timestamp and user

---

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+ (or use the included Docker setup)
- **Google Gemini API Key** (free tier) — get one at https://aistudio.google.com/apikey

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ticketai.git
cd ticketai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ticketai"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key-from-aistudio"
```

> **Tip:** Generate a secure NEXTAUTH_SECRET with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Seed the database with sample data

```bash
npx prisma db seed
```

This creates 6 users, 20 realistic tickets, comments, and activity logs.

### 6. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Docker Setup

If you prefer Docker, everything is included:

```bash
# Start PostgreSQL and the app
docker-compose up --build

# In another terminal, set up the database
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed
```

The app will be available at http://localhost:3000.

> **Note:** Set `GEMINI_API_KEY` in your environment or in `docker-compose.yml` before starting.

---

## Default Login Credentials

After seeding, use these accounts to test different roles:

| Role       | Name              | Email                    | Password      |
| ---------- | ----------------- | ------------------------ | ------------- |
| **Admin**  | Sarah Mitchell    | `admin@ticketai.com`     | `admin123`    |
| **Agent**  | James Carter      | `agent1@ticketai.com`    | `agent123`    |
| **Agent**  | Emily Rodriguez   | `agent2@ticketai.com`    | `agent123`    |
| **Customer** | Michael Thompson | `customer1@ticketai.com` | `customer123` |
| **Customer** | Lisa Nakamura   | `customer2@ticketai.com` | `customer123` |
| **Customer** | David Okonkwo   | `customer3@ticketai.com` | `customer123` |

### What to test with each role:

**As Admin** (`admin@ticketai.com` / `admin123`):
- View analytics dashboard with charts
- Manage all tickets — assign agents, change status, override AI classification
- Manage users — create, edit, deactivate

**As Agent** (`agent1@ticketai.com` / `agent123`):
- View assigned tickets
- Update ticket status (Open → In Progress → Resolved → Closed)
- Add public replies and internal notes

**As Customer** (`customer1@ticketai.com` / `customer123`):
- View personal dashboard and ticket stats
- Create a new ticket (AI will auto-classify it)
- View ticket details with AI badges
- Add comments to tickets

---

## Database Schema

Four main models:

- **User** — id, name, email, password (bcrypt), role (ADMIN/AGENT/CUSTOMER), isActive
- **Ticket** — id, title, description, status, priority, category, AI fields (aiCategory, aiPriority, aiSummary), human override fields, customer/agent relations
- **Comment** — id, content, isInternal (for agent-only notes), ticket/user relations
- **ActivityLog** — id, action, details, ticket/user relations, timestamps

```
User ──< Ticket (as customer)
User ──< Ticket (as assigned agent)
User ──< Comment
Ticket ──< Comment
Ticket ──< ActivityLog
User ──< ActivityLog
```

---

## Project Structure

```
/src
  /app
    /(auth)
      /login                — Login page with email/password
      /register             — Customer self-registration
    /(dashboard)
      /admin                — Admin dashboard with analytics charts
      /admin/tickets        — All tickets management
      /admin/tickets/[id]   — Ticket detail with admin controls
      /admin/users          — User management (CRUD)
      /admin/profile        — Admin profile settings
      /agent                — Agent dashboard (assigned tickets stats)
      /agent/tickets        — Assigned tickets list
      /agent/tickets/[id]   — Ticket detail with status update + internal notes
      /agent/profile        — Agent profile settings
      /customer             — Customer dashboard (personal stats)
      /customer/tickets     — My tickets list with search/filter
      /customer/tickets/new — Create new ticket form
      /customer/tickets/[id]— Ticket detail with comments
      /customer/profile     — Customer profile settings
    /api
      /auth/[...nextauth]   — NextAuth.js authentication handlers
      /auth/register        — Customer registration endpoint
      /tickets              — GET (list) + POST (create with AI classification)
      /tickets/[id]         — GET (detail) + PATCH (update)
      /tickets/[id]/comments— POST (add comment)
      /users                — GET (list) + POST (create) — Admin only
      /users/[id]           — GET + PATCH + DELETE (soft) — Admin/self
      /ai/classify          — POST (AI classification endpoint)
      /dashboard/stats      — GET (role-filtered statistics)
    /page.tsx               — Landing page
    /layout.tsx             — Root layout with providers
  /components
    /ui                     — shadcn/ui components (Button, Card, Dialog, etc.)
    sidebar.tsx             — Role-based sidebar navigation
    status-badge.tsx        — Color-coded status badges
    priority-badge.tsx      — Color-coded priority badges
    category-badge.tsx      — Color-coded category badges
    dashboard-shell.tsx     — Dashboard layout wrapper with auth
    theme-toggle.tsx        — Dark/light mode toggle
    providers.tsx           — Session + Theme + Toast providers
    confirm-dialog.tsx      — Reusable confirmation dialog
    pagination.tsx          — Pagination controls
    empty-state.tsx         — Empty state placeholder
    stat-card.tsx           — Dashboard metric card
  /lib
    prisma.ts               — Prisma client singleton
    auth.ts                 — NextAuth.js configuration
    validators.ts           — Zod validation schemas
    ai.ts                   — Google Gemini AI classification
    sanitize.ts             — XSS prevention text sanitizer
    env.ts                  — Environment variable validation
    utils.ts                — Tailwind CSS utility (cn)
  /types
    index.ts                — TypeScript interfaces
    next-auth.d.ts          — NextAuth type augmentation
/prisma
  schema.prisma             — Database schema (4 models, 3 enums)
  seed.ts                   — Seed script (6 users, 20 tickets, comments, logs)
```

---

## API Documentation

### Authentication
| Method | Endpoint                  | Description                | Auth Required |
| ------ | ------------------------- | -------------------------- | ------------- |
| POST   | `/api/auth/register`      | Register new customer      | No            |
| POST   | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out  | No            |

### Tickets
| Method | Endpoint                     | Description                              | Auth Required |
| ------ | ---------------------------- | ---------------------------------------- | ------------- |
| GET    | `/api/tickets`               | List tickets (filtered by user role)     | Yes           |
| POST   | `/api/tickets`               | Create ticket + AI classification        | Customer      |
| GET    | `/api/tickets/[id]`          | Get ticket with comments & activity log  | Yes           |
| PATCH  | `/api/tickets/[id]`          | Update status, priority, assign agent    | Admin/Agent   |
| POST   | `/api/tickets/[id]/comments` | Add comment or internal note             | Yes           |

### Users
| Method | Endpoint          | Description              | Auth Required |
| ------ | ----------------- | ------------------------ | ------------- |
| GET    | `/api/users`      | List all users           | Admin         |
| POST   | `/api/users`      | Create user with role    | Admin         |
| GET    | `/api/users/[id]` | Get user profile         | Admin/Self    |
| PATCH  | `/api/users/[id]` | Update user details      | Admin/Self    |
| DELETE | `/api/users/[id]` | Deactivate user (soft)   | Admin         |

### AI & Dashboard
| Method | Endpoint               | Description                         | Auth Required |
| ------ | ---------------------- | ----------------------------------- | ------------- |
| POST   | `/api/ai/classify`     | Classify ticket with Gemini AI      | Yes           |
| GET    | `/api/dashboard/stats` | Dashboard statistics (role-filtered) | Yes           |

### Error Handling
All API routes follow a consistent pattern:
- `200` — Success
- `201` — Created
- `400` — Validation error (Zod)
- `401` — Not authenticated
- `403` — Not authorized (wrong role)
- `404` — Resource not found
- `500` — Internal server error (no stack traces exposed)

---

## Security

- **Passwords** — Hashed with bcrypt (salt rounds: 10), never stored in plain text
- **Authentication** — JWT-based sessions via NextAuth.js
- **Authorization** — Role-based middleware redirects unauthorized users
- **Input Validation** — Zod schemas on every API route and client form
- **XSS Prevention** — Text inputs sanitized before storage
- **CSRF Protection** — Built into NextAuth.js
- **No exposed secrets** — `.env` is gitignored, stack traces never sent to client

---

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Set up a PostgreSQL database (Supabase, Neon, or Railway — all have free tiers)
5. Deploy

### Docker
```bash
docker-compose up --build -d
```

### Production Build
```bash
npm run build    # Generates Prisma client + Next.js production build
npm run start    # Starts production server
```

---

## Live Demo

**https://ticketai-delta.vercel.app**

---

## Author

**Imtiaz**
Built as a technical assessment for the AI-First Software Engineer position at IT Magnet.

- Task: AI-Powered Customer Ticket Management Web Application
- Tech choices: Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Google Gemini AI
- All features implemented: User management with roles, admin portal, AI classification, persistent storage

---

