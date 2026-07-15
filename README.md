# Main Street Media Unified Status

A single public status page and secure server-side health endpoint for the Main Street Media frontend and backend stack.

## Routes

- `/` — status dashboard
- `/status` — branded status dashboard alias
- `/api/status` — live health-check JSON

## Monitored services

- Main website
- Client portal
- Backend API
- Supabase database
- Supabase authentication
- Supabase storage
- Cal.com scheduling
- Stripe billing
- Audit request pipeline

## Vercel setup

Import this repository into Vercel or connect it to the existing portal project. Add the variables listed in `.env.example` under **Project Settings → Environment Variables**, then redeploy.

Missing private variables show as **Degraded / Configure…** rather than exposing secrets or internal error details.

## Security

All private API keys remain server-side. The public endpoint returns only safe service names, statuses, response times, configuration notes, and current sample history.
