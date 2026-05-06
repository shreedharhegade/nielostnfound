# NIE Lost & Found

A full-stack web application for the National Institute of Engineering (NIE) campus that helps students and staff report, search, and recover lost and found items.

---

## Features

- **Report items** — log lost or found items with title, description, category, location, date, image, and contact details
- **Search & filter** — full-text keyword search, filter by type (lost/found) and category, with pagination
- **Claim system** — logged-in users can submit a claim on any open item
- **User history** — view, edit, and manage your own reported items
- **Admin panel** — analytics dashboard, item moderation, and full audit log (admin-only)
- **Google OAuth** — login restricted to institutional Google accounts
- **Image upload** — item images stored via Cloudinary

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB via Mongoose |
| Auth | NextAuth.js (Google OAuth) |
| Image Storage | Cloudinary |
| Styling | CSS Modules + CSS Variables |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home — item listings, search, filters
│   ├── add/page.tsx          # Report a new item
│   ├── history/page.tsx      # Manage your reported items
│   ├── admin/page.tsx        # Admin dashboard (protected)
│   └── api/
│       ├── items/            # GET (list/search), POST (create)
│       │   └── [id]/         # PATCH (update), DELETE (soft-delete)
│       ├── claims/           # GET (view claims), POST (submit claim)
│       ├── admin/            # GET (analytics, logs, all items)
│       └── auth/[...nextauth]/  # Google OAuth
├── models/
│   ├── Item.ts               # Item schema with indexes + soft-delete
│   ├── Claim.ts              # Claim schema
│   └── AdminLog.ts           # Audit trail schema
├── lib/
│   ├── mongodb.ts            # Database connection
│   ├── validation.ts         # Server-side input validation
│   ├── rateLimit.ts          # In-memory rate limiter
│   └── adminAuth.ts          # Admin email guard
└── components/
    └── Navbar.tsx            # Navigation bar
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster
- A Google Cloud project with OAuth 2.0 credentials
- A Cloudinary account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nielostnfound.git
cd nielostnfound

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your credentials in .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nielostnfound

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<run: openssl rand -base64 32>

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_EMAILS=youremail@nie.ac.in
NEXT_PUBLIC_ADMIN_EMAILS=youremail@nie.ac.in
```

> **Note:** `ADMIN_EMAILS` is required. Without it the app will fail with a JSON parse error on the frontend.

---

## Database Design

### Collections

**Items** — core collection storing all lost and found reports
- Compound indexes on `{ type, status, date }`, `{ reporterEmail, createdAt }`, `{ category, status }`
- Full-text index on `title` and `description`
- Soft-delete via `deletedAt` field (null = active)

**Claims** — stores item claim requests from users
- Unique compound index on `{ itemId, claimerEmail }` prevents duplicate claims

**AdminLogs** — audit trail for all admin actions
- Indexed by `adminEmail` and `createdAt`

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/items` | Public | List items with search, filter, pagination |
| POST | `/api/items` | Required | Report a new item |
| PATCH | `/api/items/[id]` | Owner/Admin | Update an item |
| DELETE | `/api/items/[id]` | Owner/Admin | Soft-delete an item |
| GET | `/api/claims` | Owner only | View claims on your item |
| POST | `/api/claims` | Required | Submit a claim |
| GET | `/api/admin` | Admin only | Analytics, all items, audit logs |

---

## Security

- All mutating endpoints require authentication
- `PATCH` uses a field whitelist to prevent parameter injection
- `reporterEmail` is stripped from public API responses (PII protection)
- Rate limiting: 5 item reports/minute, 10 claims/hour per user
- Image uploads capped at 5 MB before hitting Cloudinary
- Admin routes gated by `ADMIN_EMAILS` environment variable

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Team

Built as a DBMS project at the National Institute of Engineering, Mysuru.
