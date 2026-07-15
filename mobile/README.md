# Main Street Media Mobile Portal

Status: Production

Flutter companion app for the Main Street Media customer portal.

## Architecture

- The app reads business state through `BusinessSnapshot` in `lib/models/business_snapshot.dart`.
- Package access is normalized to the canonical ids `core`, `elite`, and `agent_workflow_24_7`.
- Legacy aliases remain accepted for reads so the app can survive older Supabase records.

## Local Setup

- Copy `mobile/.env.example` to `mobile/.env`.
- Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CALENDLY_URL`, and `STRIPE_BILLING_URL`.
- Run `flutter run` from the `mobile/` directory.
