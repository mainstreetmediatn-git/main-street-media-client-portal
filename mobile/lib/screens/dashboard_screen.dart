import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:url_launcher/url_launcher.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  Future<void> openUrl(String? value) async {
    if (value == null || value.isEmpty) return;
    await launchUrl(Uri.parse(value), mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(child: ListTile(title: const Text('Visibility score'), subtitle: const Text('Connect Supabase to load live score.'), trailing: Text('--', style: Theme.of(context).textTheme.headlineSmall))),
          Card(child: ListTile(title: const Text('Reports'), subtitle: const Text('SEO, GBP, rankings, reviews, leads'), onTap: () => Navigator.pushNamed(context, '/reports'))),
          Card(child: ListTile(title: const Text('Request audit'), subtitle: const Text('Submit business details for review'), onTap: () => Navigator.pushNamed(context, '/audit'))),
          Card(child: ListTile(title: const Text('Book consultation'), subtitle: const Text('Calendly placeholder'), onTap: () => openUrl(dotenv.env['CALENDLY_URL']))),
          Card(child: ListTile(title: const Text('Billing'), subtitle: const Text('Stripe customer portal placeholder'), onTap: () => openUrl(dotenv.env['STRIPE_BILLING_URL']))),
        ],
      ),
    );
  }
}

