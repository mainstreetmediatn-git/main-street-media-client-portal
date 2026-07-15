import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/business_snapshot.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late final Future<BusinessSnapshot?> data = loadData();

  Future<BusinessSnapshot?> loadData() async {
    final client = Supabase.instance.client;
    final user = client.auth.currentUser;
    if (user == null) return null;

    final results = await Future.wait([
      client.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      client
          .from('audit_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', ascending: false),
      client
          .from('customer_reports')
          .select('id,user_id,report_id,assigned_at,created_at,reports(*)')
          .eq('user_id', user.id)
          .order('assigned_at', ascending: false),
    ]);

    final profile = results[0] as Map<String, dynamic>?;
    final audits = (results[1] as List).cast<Map<String, dynamic>>();
    final assignedReports = (results[2] as List).cast<Map<String, dynamic>>();

    return BusinessSnapshot.fromSupabaseRows(
      profile: profile,
      auditRequests: audits,
      customerReports: assignedReports,
    );
  }

  Future<void> openUrl(String? value, String label) async {
    if (value == null || value.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$label is not configured.')),
      );
      return;
    }
    await launchUrl(Uri.parse(value), mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: FutureBuilder<BusinessSnapshot?>(
        future: data,
        builder: (context, snapshot) {
          final portal = snapshot.data;
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (portal == null) {
            return const Center(
                child: Text('Sign in to see your business snapshot.'));
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: ListTile(
                  title:
                      Text(portal.profile.businessName ?? 'Business pending'),
                  subtitle: Text('${portal.summary.packageLabel} package'),
                  trailing: Text(portal.summary.packagePriceLabel,
                      style: Theme.of(context).textTheme.titleMedium),
                ),
              ),
              Card(
                child: ListTile(
                  title: const Text('Audit status'),
                  subtitle: Text(portal.summary.latestAuditStatusLabel),
                  onTap: () => Navigator.pushNamed(context, '/audit'),
                ),
              ),
              Card(
                child: ListTile(
                  title: const Text('Reports'),
                  subtitle: Text(
                      '${portal.summary.assignedReportCount} assigned, ${portal.summary.visibleReportCount} visible'),
                  onTap: () => Navigator.pushNamed(context, '/reports'),
                ),
              ),
              Card(
                  child: ListTile(
                      title: const Text('Request audit'),
                      subtitle:
                          const Text('Submit business details for review'),
                      onTap: () => Navigator.pushNamed(context, '/audit'))),
              Card(
                  child: ListTile(
                      title: const Text('Book consultation'),
                      subtitle: const Text('Calendly'),
                      onTap: () =>
                          openUrl(dotenv.env['CALENDLY_URL'], 'Calendly'))),
              Card(
                  child: ListTile(
                      title: const Text('Billing'),
                      subtitle: const Text('Stripe customer portal'),
                      onTap: () => openUrl(
                          dotenv.env['STRIPE_BILLING_URL'], 'Stripe billing'))),
            ],
          );
        },
      ),
    );
  }
}
