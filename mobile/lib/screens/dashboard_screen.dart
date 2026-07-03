import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late final Future<_DashboardData> data = loadData();

  Future<_DashboardData> loadData() async {
    final client = Supabase.instance.client;
    final user = client.auth.currentUser;
    if (user == null) return const _DashboardData();

    final results = await Future.wait([
      client.from('profiles').select().eq('id', user.id).maybeSingle(),
      client
          .from('audit_requests')
          .select()
          .order('created_at', ascending: false)
          .limit(1),
      client
          .from('customer_reports')
          .select('id,reports(*)')
          .order('assigned_at', ascending: false),
    ]);

    final profile = (results[0] as Map<String, dynamic>?) ?? {};
    final audits = (results[1] as List).cast<Map<String, dynamic>>();
    final assignedReports = (results[2] as List).cast<Map<String, dynamic>>();

    return _DashboardData(
      businessName: profile['business_name'] as String?,
      packageType: profile['package_type'] as String?,
      latestAuditStatus:
          audits.isEmpty ? null : audits.first['status'] as String?,
      reportCount: assignedReports.length,
    );
  }

  Future<void> openUrl(String? value) async {
    if (value == null || value.isEmpty) return;
    await launchUrl(Uri.parse(value), mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: FutureBuilder<_DashboardData>(
        future: data,
        builder: (context, snapshot) {
          final portal = snapshot.data ?? const _DashboardData();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: ListTile(
                  title: Text(portal.businessName ?? 'Business pending'),
                  subtitle: const Text('Business profile'),
                  trailing: Text(portal.packageLabel,
                      style: Theme.of(context).textTheme.titleMedium),
                ),
              ),
              Card(
                child: ListTile(
                  title: const Text('Audit status'),
                  subtitle: Text(portal.latestAuditStatusLabel),
                  onTap: () => Navigator.pushNamed(context, '/audit'),
                ),
              ),
              Card(
                child: ListTile(
                  title: const Text('Reports'),
                  subtitle: Text('${portal.reportCount} assigned reports'),
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
                      onTap: () => openUrl(dotenv.env['CALENDLY_URL']))),
              Card(
                  child: ListTile(
                      title: const Text('Billing'),
                      subtitle: const Text('Stripe customer portal'),
                      onTap: () => openUrl(dotenv.env['STRIPE_BILLING_URL']))),
            ],
          );
        },
      ),
    );
  }
}

class _DashboardData {
  const _DashboardData({
    this.businessName,
    this.packageType,
    this.latestAuditStatus,
    this.reportCount = 0,
  });

  final String? businessName;
  final String? packageType;
  final String? latestAuditStatus;
  final int reportCount;

  String get packageLabel {
    if (packageType == '197') return r'$197 Visibility';
    if (packageType == '297') return r'$297 Growth';
    return 'Pending';
  }

  String get latestAuditStatusLabel {
    final status = latestAuditStatus;
    if (status == null || status.isEmpty) return 'No request submitted';
    return status.replaceAll('_', ' ');
  }
}
