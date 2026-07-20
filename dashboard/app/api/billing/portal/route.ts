import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../lib/serverSupabase";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { getBillingProvider } from "../../../../lib/billing/stripeProvider";

export async function POST(request: Request) {
  try {
    const auth = await createServerSupabase();
    const { data: userData } = await auth?.auth.getUser() ?? { data: { user: null } };
    if (!userData.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", userData.user.id).maybeSingle();
    if (!profile?.stripe_customer_id) return NextResponse.json({ error: "No saved billing profile is available yet." }, { status: 404 });
    const returnUrl = new URL("/billing", request.headers.get("origin") || new URL(request.url).origin).toString();
    return NextResponse.json({ portalUrl: await getBillingProvider().createCustomerPortal(profile.stripe_customer_id, returnUrl) });
  } catch {
    return NextResponse.json({ error: "The billing portal is temporarily unavailable." }, { status: 503 });
  }
}
