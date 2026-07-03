# Implementation Notes

1. Create the Supabase project and push `supabase/migrations/001_initial_schema.sql`.
2. Create a private `reports` storage bucket.
3. Add the first admin by creating an auth user, then setting `profiles.role = 'platform_admin'`.
4. Configure dashboard and mobile environment variables.
5. Replace placeholder dashboard counts with server-side Supabase queries.
6. Add Stripe webhook handling to insert `billing_events`.
7. Add Calendly webhook handling to insert `appointments`.
8. Add Firebase Cloud Messaging and write mobile tokens into `push_tokens`.

