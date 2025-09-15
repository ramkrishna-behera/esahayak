
---

````markdown
# eSahayak – Buyer Lead Intake App

A **mini CRM-style app** for capturing, listing, and managing buyer leads.  
Built with **Next.js (App Router) + TypeScript + Supabase (Postgres)** and Prisma.

---

## 🚀 Setup & Local Development

### Prerequisites
- Node 18+
- A Supabase project with a `buyers` table (schema described below)

### 1️⃣ Clone & Install
```bash
git clone https://github.com/ramkrishna-behera/esahayak.git
cd esahayak
npm install
````

### 2️⃣ Environment Variables

Create a `.env.local` (or copy from `.env.example`) with:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> No migrations are bundled yet – ensure you create the tables in Supabase manually or via its SQL editor.

### 3️⃣ Run Locally

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Role  | Email                                     | Password |
| ----- | ----------------------------------------- | -------- |
| Admin | [admin1@test.com](mailto:admin1@test.com) | admin123 |
| User  | [dana@test.com](mailto:dana@test.com)     | demo123  |

---

## 🗄️ Data Model

> Supabase (Postgres) hosts the DB; Prisma is used for type-safety, not for migrations yet.

### `buyers`

| Column                | Type                                                                 | Notes                       |
| --------------------- | -------------------------------------------------------------------- | --------------------------- |
| id (uuid)             | PK                                                                   |                             |
| fullName              | text (2–80)                                                          |                             |
| email                 | text, optional                                                       |                             |
| phone                 | text, 10–15                                                          | required                    |
| city                  | enum (Chandigarh, Mohali, Zirakpur, Panchkula, Other)                |                             |
| propertyType          | enum (Apartment, Villa, Plot, Office, Retail)                        |                             |
| bhk                   | enum (1,2,3,4,Studio)                                                | required if Apartment/Villa |
| purpose               | enum (Buy, Rent)                                                     |                             |
| budgetMin / budgetMax | int, optional                                                        | `budgetMax` ≥ `budgetMin`   |
| timeline              | enum (0-3m,3-6m,>6m,Exploring)                                       |                             |
| source                | enum (Website,Referral,Walk-in,Call,Other)                           |                             |
| status                | enum (New,Qualified,Contacted,Visited,Negotiation,Converted,Dropped) | default `New`               |
| notes                 | text ≤1000                                                           |                             |
| tags                  | text\[]                                                              |                             |
| ownerId               | uuid                                                                 |                             |
| updatedAt             | timestamp                                                            |                             |

### `buyer_history`

\| id | buyerId | changedBy | changedAt | diff (JSON of field changes) |

---

## 🎨 Design Notes

### Validation

* Zod schemas planned (in `lib/validation.ts`) – partially implemented.
* Validation currently lightweight (basic Supabase checks). Budget min/max and BHK logic will be finished later.

### Rendering: SSR vs Client

* `/buyers` and `/buyers/[id]` → **SSR** for pagination & concurrency checks.
* Other routes (create form, import/export) → **Client components** (need realtime or local storage).

### Ownership & Auth

* Simple **demo login** (no magic link).
* Everyone can **read** all leads.
* Only **admins** or record **owners** can edit/delete.

### Error Handling

* Next.js `app/error.tsx` used as a global error boundary.
* No rate limiting yet.

---

## 📄 CSV Import / Export

* **Import:** via button → uploads a CSV (max 200 rows). Entire file rejected if any row is invalid.
* **Export:** downloads the current filtered list.
* Enums validated; unknown values flagged in import preview.

---

## ✨ Features Implemented

* ✅ Create, list, view, edit leads
* ✅ SSR list with pagination, filters, and debounced search
* ✅ CSV import & export
* ✅ Tags, quick status actions, file upload
* ✅ Admin vs user ownership checks

---

## ⏭️ Skipped / Work in Progress

| Area                                           | Status     | Reason                                  |
| ---------------------------------------------- | ---------- | --------------------------------------- |
| Prisma migrations & seed scripts               | ❌          | Supabase schema created manually (time) |
| Full Zod validation everywhere                 | ⚠️ partial | Time-limited                            |
| Rate limiting                                  | ❌          | Not needed for demo                     |
| Edit page polishing & concurrency errors       | 🚧         | In progress                             |
| Automated tests (CSV validator / budget logic) | ❌          | To be add later                            |

---

## 📚 Tech Stack

* [Next.js (App Router)](https://nextjs.org/docs/app)
* [TypeScript](https://www.typescriptlang.org/)
* [Supabase (Postgres)](https://supabase.com/)
* [Prisma](https://www.prisma.io/)
* [Zod](https://zod.dev/)

---

## 📝 License

MIT © 2025 [Ram Krishna Behera](https://github.com/ramkrishna-behera)

````

---


