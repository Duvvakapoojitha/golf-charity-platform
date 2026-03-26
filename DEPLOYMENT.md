# Deployment Guide

## Prerequisites
- Supabase account (PostgreSQL)
- Render or Railway account (backend)
- Vercel account (frontend)
- Stripe account (payments)

---

## 1. Database Setup (Supabase)

1. Create a new Supabase project
2. Go to SQL Editor and run `database/schema.sql`
3. Then run `database/seed.sql`
4. Copy the connection string from Settings > Database

---

## 2. Backend Deployment (Render)

1. Push code to GitHub
2. Create a new **Web Service** on Render
3. Set root directory to `backend`
4. Build command: `mvn clean package -DskipTests`
5. Start command: `java -jar target/golf-charity-0.0.1-SNAPSHOT.jar`
6. Add environment variables:
   - `DATABASE_URL` → `jdbc:postgresql://<supabase-host>:5432/postgres`
   - `DATABASE_USERNAME` → `postgres`
   - `DATABASE_PASSWORD` → your Supabase password
   - `JWT_SECRET` → any 32+ char random string
   - `STRIPE_SECRET_KEY` → from Stripe dashboard
   - `STRIPE_WEBHOOK_SECRET` → from Stripe webhook settings
   - `STRIPE_PRICE_MONTHLY` → Stripe price ID for monthly plan
   - `STRIPE_PRICE_YEARLY` → Stripe price ID for yearly plan
   - `CORS_ALLOWED_ORIGINS` → your Vercel frontend URL

---

## 3. Frontend Deployment (Vercel)

1. Import GitHub repo to Vercel
2. Set root directory to `frontend`
3. Framework preset: **Vite**
4. Add environment variable:
   - `VITE_API_URL` → your Render backend URL + `/api`
5. Deploy

---

## 4. Stripe Setup

1. Create products in Stripe Dashboard:
   - Monthly: $9.99/month recurring
   - Yearly: $99.99/year recurring
2. Copy price IDs to env vars
3. Set webhook endpoint to `https://your-backend.render.com/api/subscriptions/webhook`

---

## Test Credentials

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@golfcharity.com    | Admin@123 |
| User  | user@golfcharity.com     | User@123  |

---

## Local Development

```bash
# Backend
cd backend
cp ../.env.example .env  # fill in values
mvn spring-boot:run

# Frontend
cd frontend
cp .env.example .env.local  # fill in values
npm install
npm run dev
```
