# TeacherPlanet

A gamified book-purchase competition platform for schools. Teachers "buy" books from admin-curated categories, every approved purchase counts toward a live leaderboard, and top performers win real gifts.

- **Backend**: [`backend/`](backend) — Laravel 13 (PHP 8.3) REST API
- **Frontend**: [`frontend/`](frontend) — React 19 + Vite + TypeScript SPA

## Features

**Teachers**
- Sign up (with phone number and a Maths/Science subject choice) / log in with email+password or Google
- Browse book categories scoped to their own subject — Maths teachers see Maths; Science teachers see General Science, Chemistry, Physics, and Biology
- Books are shown as book-shaped cards (spine, cover art, page edge) with cover images and attached PDFs uploaded by admin, viewable in a gallery
- Mark a book as "bought": upload a purchase receipt (image or PDF) with an optional note, creating a pending request
- **My Requests** page — full history of every request they've made and its outcome (pending / approved / rejected), with the receipt and any admin note
- See a live top-10 leaderboard scoped to their own subject (day / month / year / all-time), plus their own position if outside the top 10
- Track gifts won and progress toward the next automatic gift
- Self-service profile page: edit name, email, phone, subject, password, and profile picture

**Admin**
- Full ranking of every teacher by approved book purchases, shown as two side-by-side tables (Maths / Science)
- Review purchase requests — view the teacher's uploaded receipt and note before approving or rejecting, with a Pending/All-history/Approved/Rejected tab switcher and search/filter by teacher, book, category, date
- Full CRUD on categories (grouped by Maths/Science subject; seeded: Maths, General Science, Chemistry, Physics, Biology) and their books, with multi-file image/PDF attachments per book
- Manage teacher accounts (including phone numbers and subject), with a subject filter and a one-click export of the full roster to an Excel (.xlsx) sheet
- Manage **assistants** — admin-created accounts with a granular, per-module permission matrix (view/add/edit/delete across categories, books, teachers, requests, gifts, notifications)
- Manage **other admins** — full-access accounts, admin-only, self-deletion blocked
- Manage gifts: iPhone & Smart Watch (manually awarded, criteria admin's choice), Smartboard (auto-awarded to the top teacher at year end), iPad (auto-awarded to the top teacher each term / 6 months) — every gift's criteria is editable
- Notification bell for purchase-request activity

**Assistants**
- See the same admin dashboard, scoped to whichever permissions the admin granted them

## Tech Stack

| | |
|---|---|
| Backend | Laravel 13, PHP 8.3, MySQL |
| Auth | Laravel Sanctum (SPA cookie auth) + Laravel Socialite (Google OAuth) |
| RBAC | `spatie/laravel-permission` — `module.action` permission keys |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion |
| Data fetching | TanStack Query, Axios |
| State | Zustand |

## Project Structure

```
backend/    Laravel API — routes/api.php, app/Http/Controllers, app/Models, app/Services
frontend/   React SPA — src/features (pages by role), src/components/ui, src/api
```

## Getting Started

### Prerequisites

- PHP 8.3+ and Composer
- Node 18+ and npm
- MySQL (or MariaDB, e.g. via XAMPP)

### Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env`:
- Set `DB_*` to point at a MySQL database you've created (e.g. `rank_system`)
- Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if you want Google login to work — create OAuth credentials at the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), with authorized redirect URI `http://localhost:8000/auth/google/callback`

Then:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

The API is now running at `http://localhost:8000`.

To have gifts auto-award on schedule, run the scheduler (or invoke it manually):

```bash
php artisan app:award-periodic-gifts   # run once, or wire into `schedule:run` / a cron job
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app is now running at `http://localhost:5173`.

### Seeded demo accounts

The database seeder creates:

| Role | Email | Password |
|---|---|---|
| Teacher | `teacher@ranksystem.test` | `password` |

No admin account is seeded by default — create one directly via `php artisan tinker`:

```php
$admin = \App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@example.com',
    'password' => 'change-me',
    'is_active' => true,
]);
$admin->assignRole('admin');
```

Every other admin, assistant, or teacher account can then be created from the admin dashboard (or via public self-signup, for teachers).

## Notes

- Public self-signup is teacher-only. Admin and assistant accounts are always created by an existing admin.
- Assistant permissions are assigned individually (not role-shared), so two assistants can have completely different access.
- Rank is computed live from approved purchase requests — not cached — filterable by day/month/year/all-time.
- The app runs on `Africa/Cairo` time (`APP_TIMEZONE` in `backend/.env`), which drives the leaderboard's period boundaries and the gift-award scheduler's term/year windows.
