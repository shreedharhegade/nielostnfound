# NIE Lost & Found — Improvements Log

All changes made over the original codebase, organized by category.

---

## 1. Database Schema (`src/models/`)

### Item model (`Item.ts`)
- Added **compound indexes**: `{ type, status, date }`, `{ reporterEmail, createdAt }`, `{ category, status }` — dramatically speeds up all common queries
- Added **full-text index** on `title` and `description` — enables MongoDB `$text` search
- Added **soft-delete**: `deletedAt` field (null = active, Date = deleted) — preserves audit history instead of destroying records
- Added `updatedAt` via Mongoose `timestamps: true`
- Added `maxlength` and `trim` constraints directly on the schema — server-enforced data quality
- Added `expired` as a valid status value
- Email stored in `lowercase` to prevent case-sensitivity bugs

### Claim model (`Claim.ts`) — **new**
- Structured claim system: `{ itemId, claimerEmail, claimerName, message, status }`
- Unique compound index `{ itemId, claimerEmail }` prevents duplicate claims
- Status enum: `pending | accepted | rejected`

### AdminLog model (`AdminLog.ts`) — **new**
- Audit trail for all admin actions: `delete_item`, `expire_item`, `resolve_item`, `view_all`
- Indexed by `adminEmail` and `createdAt` for fast log queries

---

## 2. API Layer

### `GET /api/items`
- Added **pagination**: `page` param, returns `{ data, pagination: { page, pageSize, total, totalPages } }` — prevents fetching entire collection
- Added **search**: `?search=keyword` uses MongoDB full-text index
- Added **category filter**: `?category=Electronics`
- Added **PII protection**: `reporterEmail` stripped from public responses; only returned to the authenticated owner querying their own items
- Soft-delete filter: `deletedAt: null` on all queries
- Combined with `Promise.all` for count + data in parallel

### `POST /api/items`
- Added **server-side validation** (`src/lib/validation.ts`) with field-level error responses (`422` status with `errors[]` array)
- Added **rate limiting** (`src/lib/rateLimit.ts`): 5 reports/minute per user, returns `429`
- Added **image size guard**: rejects uploads over 5 MB before calling Cloudinary
- Removed `console.log("CLOUDINARY UPLOAD SUCCESS")` debug noise

### `PATCH /api/items/[id]`
- **Field whitelist**: only `title`, `description`, `location`, `date`, `reporterPhone`, `status` can be patched — prevents overwriting `reporterEmail` or other sensitive fields
- Admins can patch any item (not just their own)
- Logs admin actions to `AdminLog`
- Uses `deletedAt: null` check (respects soft-delete)

### `DELETE /api/items/[id]`
- Changed from `findByIdAndDelete` to **soft-delete** (`{ deletedAt: new Date() }`)
- Admins can delete any item
- Logs admin deletions to `AdminLog`

### `GET /api/claims` — **new**
- Item owners can view claims filed against their items

### `POST /api/claims` — **new**
- Authenticated users can submit a claim on any open item
- Rate limited: 10 claims/hour per user
- Prevents self-claiming (reporter cannot claim own item)
- Upserts to prevent duplicate claims from same person

### `GET /api/admin` — **new**
- Protected: only emails listed in `ADMIN_EMAILS` env var can access
- `?view=analytics`: returns summary stats + category breakdown via MongoDB aggregation pipeline
- `?view=items`: paginated list of all items including deleted
- `?view=logs`: recent 100 admin actions

---

## 3. Security

### Input validation (`src/lib/validation.ts`) — **new**
- `validateItemInput`: validates all POST fields server-side (types, lengths, enums, date in past, phone format)
- `validateClaimInput`: validates claim message
- `sanitizeString`: strips HTML tags from string input

### Rate limiter (`src/lib/rateLimit.ts`) — **new**
- In-memory sliding window rate limiter
- Configurable `windowMs` and `max` per key
- Auto-cleans stale entries every 5 minutes
- Replace with Redis-backed limiter for production multi-instance deployments

### Admin guard (`src/lib/adminAuth.ts`) — **new**
- `isAdmin(session)`: checks user email against `ADMIN_EMAILS` env variable
- Centralized — one place to update admin list

### PII reduction
- `reporterEmail` no longer returned in public item listings
- Only phone number exposed publicly (which the reporter opted to provide)

### PATCH field whitelist
- Prevents parameter pollution / field injection attacks on the update endpoint

---

## 4. Frontend

### Home page (`src/app/page.tsx`)
- **Search bar** with 400 ms debounce — uses server-side full-text search
- **Category filter** tabs (All / Electronics / Keys / Documents / Clothing / Other)
- **Pagination** controls with page info
- **Skeleton loading cards** (shimmer animation) — replaces plain text "Refreshing..."
- **Results count** displayed above the grid
- **Category badge** on each card (alongside LOST/FOUND badge)
- `loading="lazy"` on all item images
- Removed `reporterEmail` from display (no longer in API response)
- Removed hardcoded inline styles for contact buttons

### Add item page (`src/app/add/page.tsx`)
- **Inline field-level errors** — shown below each invalid field, not via `alert()`
- **Global error banner** for network/server errors
- **Success message** with auto-redirect
- Handles `429` (rate limit) and `422` (validation) responses distinctly
- Max length attributes match server-side validation (`maxLength={100}` on title, `500` on description)
- Image size hint shown to user

### History page (`src/app/history/page.tsx`)
- **Optimistic UI** for status toggle: updates immediately, rolls back on failure
- **Optimistic UI** for delete: removes card immediately, restores on failure
- Inline success/error banners instead of `alert()`
- `loading="lazy"` on images
- Modal closes on backdrop click
- Category shown on each card

### Navbar (`src/components/Navbar.tsx`)
- **Admin link** shown only to users whose email matches `NEXT_PUBLIC_ADMIN_EMAILS`

### Admin page (`src/app/admin/page.tsx`) — **new**
- Tab-based view: Analytics / All Items / Audit Logs
- **Analytics**: summary stat cards + category progress bars using MongoDB aggregation
- **All Items**: full table with resolve/soft-delete actions, shows deleted items (grayed out)
- **Audit Logs**: timestamped table of all admin actions
- All actions write to `AdminLog` collection

### CSS additions (`globals.css`, `page.css`)
- `.alert`, `.alert-error`, `.alert-success` — inline feedback banners
- `.field-error`, `.input-error` — per-field validation styling
- `.skeleton`, `.skeleton-*` — shimmer skeleton loading cards
- `.search-bar`, `.search-input`, `.search-clear` — search UI
- `.category-tabs`, `.category-btn` — category pill filters
- `.category-badge` — category label on item cards
- `.pagination`, `.page-btn`, `.page-info` — pagination controls
- `.results-count` — result count text
- `.modal-overlay`, `.modal-content` — shared modal styles
- `.resolved-banner`, `.item-resolved` — resolved item visual treatment

---

## 5. Configuration

### `.env.local.example` — updated
- Added `ADMIN_EMAILS` (server-side)
- Added `NEXT_PUBLIC_ADMIN_EMAILS` (client-side navbar guard)

---

## Suggested Next Steps (not implemented — scope/infra dependent)

- **Email notifications**: use Resend or Nodemailer to email reporters when their item receives a claim
- **Expiry cron job**: Vercel scheduled function to mark items older than 30 days as `expired`
- **Redis rate limiter**: replace in-memory `rateLimit.ts` with `ioredis` for multi-instance deployments
- **Claim accept/reject UI**: let the reporter respond to claims from the history page
- **Similar items suggestion**: on POST success, query for matching found/lost items in same category
