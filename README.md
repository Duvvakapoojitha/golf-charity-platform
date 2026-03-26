# Golf Charity Subscription Platform

> Play golf. Win prizes. Give back.

A subscription-based platform where golf players submit their scores, compete in monthly prize draws, and automatically donate a portion of their winnings to a charity of their choice.

Built as a full-stack assignment for Digital Heroes — digitalheroes.co.in

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Spring Boot 3 (Java 17) |
| Database | PostgreSQL (local or Supabase) |
| Auth | JWT tokens |
| Payments | Stripe (mock mode in dev) |
| Email | Spring Mail (SMTP) |
| File Upload | Cloudinary |
| Frontend Deploy | Vercel |
| Backend Deploy | Render / Railway |

---

## Quick Start (Local Development)

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```sql
CREATE DATABASE golf_charity;
```

### 2. Backend

```powershell
cd backend

$env:DATABASE_PASSWORD="your-postgres-password"
$env:JWT_SECRET="golf-charity-super-secret-jwt-key-32chars!!"
$env:STRIPE_SECRET_KEY="sk_test_placeholder"
$env:STRIPE_WEBHOOK_SECRET="whsec_placeholder"
$env:STRIPE_PRICE_MONTHLY="price_placeholder"
$env:STRIPE_PRICE_YEARLY="price_placeholder"

mvn spring-boot:run
```

On first run automatically:
- Creates all database tables
- Seeds 8 charities
- Creates the admin user

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173` — Backend: `http://localhost:8080`

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@golfcharity.com | Admin@123 |
| User | poojitha@gmail.com | 123456 |

---

## How The Platform Works

```
User registers → picks charity → sets donation %
       ↓
User subscribes ($9.99/month or $99.99/year)
       ↓
Subscription fee added to prize pool
       ↓
User adds golf scores (1–45, max 5 at a time)
       ↓
Admin runs monthly draw → 5 numbers generated
       ↓
System matches every subscribed user's scores against draw numbers
       ↓
Winners found → prizes calculated automatically
       ↓
Winners upload proof → Admin approves → Prize paid
       ↓
Charity donation deducted from winnings automatically
```

### Prize Distribution

```
5 matches → Jackpot  → 40% of prize pool (rolls over if no winner)
4 matches →            35% of prize pool
3 matches →            25% of prize pool

Multiple winners at same tier → prize split equally
```

---

## User Dashboard — 5 Tabs

### Scores Tab
- Add golf scores (1–45) with a date
- Edit or delete existing scores
- Maximum 5 scores — oldest auto-removed when adding a 6th
- Displayed in reverse chronological order

### Subscription Tab
- Choose Monthly ($9.99) or Yearly ($99.99)
- Subscribe Now to activate instantly (mock payment in dev)
- Cancel anytime
- Must be active to participate in draws

### Charity Tab
- Select which charity receives your donation
- Set donation percentage (minimum 10%)
- Change charity or percentage anytime

### Summary Tab *(new)*
- Draws entered count
- Total wins and total prize amount won
- Pending payments count
- Score progress bar (X/5)
- Active subscription status with draw eligibility

### Winnings Tab
- View all prizes won with match type and amount
- Upload proof via file upload or URL
- See charity donation breakdown and net prize
- Track payment status: PENDING → APPROVED → PAID

---

## Admin Dashboard — 5 Tabs

### Analytics Tab
- Total users, active subscriptions, prize pool, total paid out
- Visual bar chart of all key metrics

### Users Tab
- View all registered users with email, role, charity, donation %
- Inline score editor — view, edit, and delete any user's scores *(new)*
- Delete users

### Draws Tab
- Create new draw (RANDOM or ALGORITHM mode)
- Simulate — run matching without publishing
- Publish — make results live
- Re-run — republish with updated scores *(new)*

### Charities Tab
- Full CRUD — add, edit, delete charities
- Name, description, image URL, website, category

### Verification Tab
- View all winners with proof links
- Approve winners — triggers charity donation calculation *(new)*
- Mark as paid — sends payment confirmation email *(new)*
- Add admin notes

---

## Additional Features

### Charity Donation Calculation *(new)*
When admin approves a winner, the system automatically calculates:
- `charityDonation` = prizeAmount × donationPercentage / 100
- `netPrize` = prizeAmount − charityDonation

Shown in the user's Winnings tab as a breakdown.

### Email Notifications *(new)*
Four automated emails (async, non-blocking):
- Welcome email on registration
- Draw result email when winners are found (with draw numbers and prize)
- Approval email when admin approves (shows net prize + donation)
- Payment confirmation when marked paid (shows charity name)

To enable, set environment variables:
```
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
```

### Real File Upload *(new)*
Winners can upload actual image/PDF files as proof via Cloudinary.
Falls back to URL input if Cloudinary is not configured.

To enable:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Stripe Webhook *(new)*
`POST /api/subscriptions/webhook` handles `checkout.session.completed`.
Auto-activates subscription after real Stripe payment.
Set `STRIPE_WEBHOOK_SECRET` to your Stripe webhook signing secret.

### Featured Charity Spotlight *(new)*
Homepage displays 3 featured charities with images and descriptions.
Middle charity highlighted as "Spotlight".

### Participation Summary *(new)*
User dashboard Summary tab shows draws entered, wins, total earned,
pending payments, score progress, and subscription eligibility status.

### Admin Score Editing *(new)*
Admins can view, edit, and delete any user's golf scores directly
from the Users tab without needing to impersonate the user.

---

## API Endpoints

### Auth (public)
```
POST /api/auth/register
POST /api/auth/login
```

### User
```
GET   /api/users/me
PATCH /api/users/me
GET   /api/users/me/participation
```

### Scores
```
GET    /api/scores
POST   /api/scores
PUT    /api/scores/:id
DELETE /api/scores/:id
```

### Subscriptions
```
GET  /api/subscriptions/status
POST /api/subscriptions/mock-activate
POST /api/subscriptions/cancel
POST /api/subscriptions/webhook
```

### Draws (public GET)
```
GET  /api/draws
GET  /api/draws/:id
GET  /api/draws/:id/winners
```

### Draws (admin only)
```
POST /api/draws
POST /api/draws/:id/simulate
POST /api/draws/:id/publish
```

### Charities (public GET)
```
GET /api/charities
GET /api/charities/:id
```

### Charities (admin only)
```
POST   /api/charities
PUT    /api/charities/:id
DELETE /api/charities/:id
```

### Winners
```
GET  /api/winners/my
POST /api/winners/:id/proof
POST /api/winners/:id/proof/upload
```

### Admin
```
GET    /api/admin/users
DELETE /api/admin/users/:id
GET    /api/admin/users/:userId/scores
PUT    /api/admin/scores/:scoreId
DELETE /api/admin/scores/:scoreId
GET    /api/admin/subscriptions
GET    /api/admin/analytics
GET    /api/winners
PATCH  /api/winners/:id/status
```

---

## PRD Compliance Checklist

| Requirement | Status |
|-------------|--------|
| User registration and login | ✅ |
| JWT role-based auth (USER/ADMIN) | ✅ |
| Monthly and yearly subscription plans | ✅ |
| Stripe payment integration | ✅ |
| Stripe webhook auto-activation | ✅ |
| Score entry 1–45 Stableford format | ✅ |
| Max 5 scores, auto-replace oldest | ✅ |
| Reverse chronological score display | ✅ |
| Random draw generation | ✅ |
| Algorithm draw (frequency-based) | ✅ |
| 5/4/3 match prize tiers | ✅ |
| 40/35/25 prize pool split | ✅ |
| Jackpot rollover | ✅ |
| Charity selection at signup | ✅ |
| Min 10% donation percentage | ✅ |
| Charity donation calculation on payout | ✅ |
| Charity listing with search and filter | ✅ |
| Featured charity spotlight on homepage | ✅ |
| Winner proof upload (file + URL) | ✅ |
| Admin approve/reject winners | ✅ |
| Payment status tracking | ✅ |
| User dashboard — subscription status | ✅ |
| User dashboard — score entry/edit | ✅ |
| User dashboard — charity + donation % | ✅ |
| User dashboard — participation summary | ✅ |
| User dashboard — winnings overview | ✅ |
| Admin — user management | ✅ |
| Admin — edit user golf scores | ✅ |
| Admin — draw configuration and simulation | ✅ |
| Admin — charity CRUD | ✅ |
| Admin — winner verification | ✅ |
| Admin — analytics and reports | ✅ |
| Email notifications | ✅ |
| Mobile-first responsive design | ✅ |
| Modern emotion-driven UI | ✅ |
| Error handling | ✅ |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full step-by-step instructions:
- Frontend → Vercel (new account as per PRD)
- Backend → Render
- Database → Supabase (new project as per PRD)

---

## Project Structure

```
golf__/
├── frontend/
│   └── src/
│       ├── api/               # Axios API calls
│       ├── components/
│       │   ├── admin/         # UserTable, DrawManager, CharityManager,
│       │   │                  # WinnerVerification, UserScoreEditor
│       │   ├── common/        # Navbar, Footer, Loader
│       │   └── dashboard/     # ScoreForm, ScoreList, SubscriptionCard,
│       │                      # CharitySelector, WinningsCard, ParticipationSummary
│       ├── context/           # AuthContext
│       ├── hooks/             # useAuth
│       ├── pages/             # Home, Login, Register, Dashboard,
│       │                      # AdminDashboard, Charities, Draws, Subscription
│       ├── routes/            # ProtectedRoute
│       └── utils/             # helpers, constants
│
├── backend/
│   └── src/main/java/com/golf/
│       ├── config/            # JacksonConfig, DataInitializer
│       ├── controller/        # Auth, User, Score, Draw, Charity,
│       │                      # Subscription, Winner, Admin
│       ├── dto/               # Request/response DTOs, ParticipationSummaryDto
│       ├── exception/         # GlobalExceptionHandler
│       ├── model/             # User, Score, Draw, Charity, Subscription, Winner
│       ├── repository/        # Spring Data JPA repositories
│       ├── security/          # JwtUtil, JwtFilter, SecurityConfig
│       └── service/           # Auth, User, Score, Draw, Charity,
│                              # Subscription, Winner, Email, FileUpload
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── DEPLOYMENT.md
└── README.md
```

---

## Issued By

Digital Heroes · digitalheroes.co.in
Full-Stack Development Trainee Selection Process — Version 1.0 · March 2026
