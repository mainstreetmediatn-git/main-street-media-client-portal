import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final stream = Supabase.instance.client.from('reports').stream(primaryKey: ['id']);
    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: stream,
        builder: (context, snapshot) {
          final reports = snapshot.data ?? [];
          if (reports.isEmpty) {
            return const Center(child: Text('Reports will appear here when ready.'));
          }
          return ListView.builder(
            itemCount: reports.length,
            itemBuilder: (context, index) {
              final report = reports[index];
              return ListTile(
                title: Text(report['title'] as String? ?? 'Report'),
                subtitle: Text(report['summary'] as String? ?? ''),
                trailing: Text((report['required_access'] as String? ?? 'starter').toUpperCase()),
              );
            },
          );
        },
      ),
    );
  }
}

