import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/business_snapshot.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  late final Future<BusinessSnapshot?> data = loadReports();

  Future<BusinessSnapshot?> loadReports() async {
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
    final rows = (results[2] as List).cast<Map<String, dynamic>>();
    return BusinessSnapshot.fromSupabaseRows(
      profile: profile,
      auditRequests: audits,
      customerReports: rows,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: FutureBuilder<BusinessSnapshot?>(
        future: data,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final portal = snapshot.data;
          if (portal == null) {
            return const Center(child: Text('Sign in to see your reports.'));
          }
          if (portal.reports.isEmpty) {
            return const Center(
                child: Text('Reports will appear here when ready.'));
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: ListTile(
                  title: const Text('Latest audit status'),
                  subtitle: Text(portal.latestAuditStatusLabel),
                ),
              ),
              Card(
                child: ListTile(
                  title: Text(portal.summary.packageLabel),
                  subtitle: Text(portal.summary.packagePriceLabel),
                  trailing: Text(
                      '${portal.summary.visibleReportCount}/${portal.summary.assignedReportCount} visible'),
                ),
              ),
              ...portal.reports.map((report) {
                final unlocked = portal.visibleReports.contains(report);
                return ListTile(
                  leading: Icon(unlocked
                      ? Icons.description_outlined
                      : Icons.lock_outline),
                  title: Text(report.title),
                  subtitle: Text(
                      unlocked ? report.description : 'Growth package report'),
                  trailing: Text(report.requiredPackage.displayLabel),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
