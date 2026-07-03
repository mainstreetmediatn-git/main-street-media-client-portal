import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  late final Future<_ReportsData> data = loadReports();

  Future<_ReportsData> loadReports() async {
    final client = Supabase.instance.client;
    final user = client.auth.currentUser;
    if (user == null) return const _ReportsData();

    final results = await Future.wait([
      client
          .from('profiles')
          .select('package_type')
          .eq('id', user.id)
          .maybeSingle(),
      client
          .from('customer_reports')
          .select('id,reports(*)')
          .order('assigned_at', ascending: false),
    ]);

    final profile = (results[0] as Map<String, dynamic>?) ?? {};
    final rows = (results[1] as List).cast<Map<String, dynamic>>();
    final reports = rows
        .map((row) => row['reports'])
        .whereType<Map<String, dynamic>>()
        .map(_Report.fromJson)
        .toList();

    return _ReportsData(
      packageType: profile['package_type'] as String?,
      reports: reports,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: FutureBuilder<_ReportsData>(
        future: data,
        builder: (context, snapshot) {
          final portal = snapshot.data ?? const _ReportsData();
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (portal.reports.isEmpty) {
            return const Center(
                child: Text('Reports will appear here when ready.'));
          }
          return ListView.builder(
            itemCount: portal.reports.length,
            itemBuilder: (context, index) {
              final report = portal.reports[index];
              final unlocked = portal.canAccess(report.requiredPackage);
              return ListTile(
                leading: Icon(
                    unlocked ? Icons.description_outlined : Icons.lock_outline),
                title: Text(report.title),
                subtitle: Text(
                    unlocked ? report.description : 'Growth package report'),
                trailing:
                    Text(report.requiredPackage == '297' ? r'$297' : r'$197'),
              );
            },
          );
        },
      ),
    );
  }
}

class _ReportsData {
  const _ReportsData({this.packageType, this.reports = const []});

  final String? packageType;
  final List<_Report> reports;

  bool canAccess(String requiredPackage) {
    if (requiredPackage == '197') {
      return packageType == '197' || packageType == '297';
    }
    return packageType == '297';
  }
}

class _Report {
  const _Report({
    required this.title,
    required this.description,
    required this.requiredPackage,
  });

  final String title;
  final String description;
  final String requiredPackage;

  factory _Report.fromJson(Map<String, dynamic> json) {
    return _Report(
      title: json['title'] as String? ?? 'Report',
      description: json['description'] as String? ??
          'Assigned report from Main Street Media Co.',
      requiredPackage: json['visibility_package_required'] as String? ?? '197',
    );
  }
}
