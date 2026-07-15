# Supabase OAuth Setup

Status: Production

The portal is wired for Google and GitHub OAuth on the Next.js dashboard and Flutter mobile app. Provider client secrets must stay in Supabase or the provider console, not in this repository.

## Supabase

Project URL used by the apps:

```text
https://wdxalrvkrmeewnqiqxqk.supabase.co
```

In Supabase Dashboard > Authentication > URL Configuration, set:

```text
Site URL: http://127.0.0.1:3000
Additional Redirect URLs:
http://127.0.0.1:3000/dashboard
http://localhost:3000/dashboard
com.mainstreetmedia.portal://login-callback
```

Add the production dashboard URL when you deploy it, for example:

```text
https://your-domain.example/dashboard
```

In Supabase Dashboard > Authentication > Sign In / Providers:

1. Enable Google.
2. Enable GitHub.
3. Paste each provider client ID and secret.

## Provider Callback URLs

Use the Supabase auth callback as the callback URL in each provider console:

```text
https://wdxalrvkrmeewnqiqxqk.supabase.co/auth/v1/callback
```

Google also needs the dashboard origins in Authorized JavaScript origins:

```text
http://127.0.0.1:3000
http://localhost:3000
```

Add the production dashboard origin when deployed.

## Mobile Deep Link

The Flutter app uses this callback URL after Supabase completes OAuth:

```text
com.mainstreetmedia.portal://login-callback
```

Android and iOS are both registered for that scheme in their native manifests.
