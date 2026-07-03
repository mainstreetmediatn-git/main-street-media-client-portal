import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuditRequestScreen extends StatefulWidget {
  const AuditRequestScreen({super.key});

  @override
  State<AuditRequestScreen> createState() => _AuditRequestScreenState();
}

class _AuditRequestScreenState extends State<AuditRequestScreen> {
  final formKey = GlobalKey<FormState>();
  final businessName = TextEditingController();
  final website = TextEditingController();
  final serviceArea = TextEditingController();
  final industry = TextEditingController();
  final phone = TextEditingController();
  final email = TextEditingController();

  Future<void> submit() async {
    if (!formKey.currentState!.validate()) return;
    final user = Supabase.instance.client.auth.currentUser;
    await Supabase.instance.client.from('audit_requests').insert({
      'profile_id': user?.id,
      'business_name': businessName.text.trim(),
      'website_url': website.text.trim(),
      'service_area': serviceArea.text.trim(),
      'industry': industry.text.trim(),
      'phone': phone.text.trim(),
      'email': email.text.trim(),
    });
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Visibility audit')),
      body: Form(
        key: formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(controller: businessName, decoration: const InputDecoration(labelText: 'Business name'), validator: required),
            TextFormField(controller: website, decoration: const InputDecoration(labelText: 'Website')),
            TextFormField(controller: serviceArea, decoration: const InputDecoration(labelText: 'Service area')),
            TextFormField(controller: industry, decoration: const InputDecoration(labelText: 'Industry')),
            TextFormField(controller: phone, decoration: const InputDecoration(labelText: 'Phone')),
            TextFormField(controller: email, decoration: const InputDecoration(labelText: 'Email'), validator: required),
            const SizedBox(height: 20),
            FilledButton(onPressed: submit, child: const Text('Submit audit request')),
          ],
        ),
      ),
    );
  }
}

String? required(String? value) => value == null || value.trim().isEmpty ? 'Required' : null;

