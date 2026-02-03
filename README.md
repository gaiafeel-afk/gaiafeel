# Somatic Daily Worksheet App (MVP)

Monorepo containing:

- `apps/mobile`: Expo React Native app (iOS + Android)
- `apps/rca-web`: React + Vite web app for RCA price estimation
- `packages/shared`: Shared TypeScript contracts and progression utilities
- `packages/rca-engine`: Pure pricing engine used by the RCA web app
- `supabase`: Schema migrations, RLS policies, and edge functions

## Quick start

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create app environment:
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   ```
3. Run mobile app:
   ```bash
   pnpm --filter @somatic/mobile dev
   ```
4. Run tests:
   ```bash
   pnpm test
   ```

## RCA web app

Run the calculator:

```bash
pnpm dev:rca-web
```

## Mobile app routes

- Onboarding: `apps/mobile/app/onboarding.tsx`
- Sign-in: `apps/mobile/app/(auth)/sign-in.tsx`
- Home + progression: `apps/mobile/app/(tabs)/home.tsx`
- Worksheet submit flow: `apps/mobile/app/worksheet.tsx`
- Subscription paywall: `apps/mobile/app/subscription.tsx`
- History/settings: `apps/mobile/app/(tabs)/history.tsx`, `apps/mobile/app/(tabs)/settings.tsx`

## Supabase

- Migrations are in `supabase/migrations`.
- Edge functions are in `supabase/functions`.
- Configure function secrets in Supabase dashboard:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
  - `REVENUECAT_WEBHOOK_SECRET`

### Edge functions shipped

- `progression-get-state` -> RPC `get_daily_state`
- `progression-complete` -> RPC `complete_daily_worksheet`
- `billing-webhook-revenuecat` -> entitlement upsert from RevenueCat events
- `account-delete` -> authenticated account deletion endpoint

## GitHub live demo (web)

- Workflow: `.github/workflows/deploy-web-demo.yml`
- On push to `main`, GitHub Pages publishes a static Expo web build.
- For demo-only deployments, default placeholder public env values are used.
- To wire real backend data, set repository variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
  - `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`

## Product rules implemented

- One worksheet completion per local calendar day.
- Linear progression with daily unlock.
- Missed day resets progression by one worksheet per missed day (floored at 1).
- First 3 worksheets are free; worksheet 4+ requires active entitlement.
