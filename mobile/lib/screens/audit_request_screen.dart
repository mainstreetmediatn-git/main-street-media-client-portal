import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/business_snapshot.dart';

class AuditRequestScreen extends StatefulWidget {
  const AuditRequestScreen({super.key});

  @override
  State<AuditRequestScreen> createState() => _AuditRequestScreenState();
}

class _AuditRequestScreenState extends State<AuditRequestScreen> {
  final formKey = GlobalKey<FormState>();
  final businessName = TextEditingController();
  final website = TextEditingController();
  final phone = TextEditingController();
  final email = TextEditingController();
  final businessCategory = TextEditingController();
  final city = TextEditingController();
  final state = TextEditingController();
  final notes = TextEditingController();
  bool submitting = false;
  String? error;

  @override
  void initState() {
    super.initState();
    _prefillBusinessProfile();
  }

  @override
  void dispose() {
    businessName.dispose();
    website.dispose();
    phone.dispose();
    email.dispose();
    businessCategory.dispose();
    city.dispose();
    state.dispose();
    notes.dispose();
    super.dispose();
  }

  Future<void> _prefillBusinessProfile() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    final profile = await Supabase.instance.client
        .from('profiles')
        .select(
            'id,full_name,email,business_name,phone,package_type,role,created_at,updated_at')
        .eq('id', user.id)
        .maybeSingle();

    if (!mounted || profile == null) return;

    final businessSnapshot = BusinessProfile.fromJson(profile);

    if (businessName.text.isEmpty && businessSnapshot.businessName != null) {
      businessName.text = businessSnapshot.businessName!;
    }
    if (phone.text.isEmpty && businessSnapshot.phone != null) {
      phone.text = businessSnapshot.phone!;
    }
    if (email.text.isEmpty && businessSnapshot.email != null) {
      email.text = businessSnapshot.email!;
    }
  }

  Future<void> submit() async {
    if (!formKey.currentState!.validate()) return;
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      setState(() => error = 'Log in before submitting an audit request.');
      return;
    }

    setState(() {
      submitting = true;
      error = null;
    });

    try {
      await Supabase.instance.client.from('audit_requests').insert({
        'user_id': user.id,
        'business_name': businessName.text.trim(),
        'website': website.text.trim(),
        'phone': phone.text.trim(),
        'email': email.text.trim(),
        'business_category': businessCategory.text.trim(),
        'city': city.text.trim(),
        'state': state.text.trim().toUpperCase(),
        'notes': notes.text.trim(),
        'status': 'pending',
      });
      if (mounted) Navigator.pop(context);
    } on PostgrestException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } finally {
      if (mounted) setState(() => submitting = false);
    }
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
            TextFormField(
                controller: businessName,
                decoration: const InputDecoration(labelText: 'Business name'),
                validator: required),
            TextFormField(
                controller: website,
                decoration: const InputDecoration(labelText: 'Website')),
            TextFormField(
                controller: phone,
                decoration: const InputDecoration(labelText: 'Phone')),
            TextFormField(
                controller: email,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: required),
            TextFormField(
                controller: businessCategory,
                decoration:
                    const InputDecoration(labelText: 'Business category')),
            TextFormField(
                controller: city,
                decoration: const InputDecoration(labelText: 'City')),
            TextFormField(
                controller: state,
                decoration: const InputDecoration(labelText: 'State'),
                maxLength: 2),
            TextFormField(
                controller: notes,
                decoration: const InputDecoration(labelText: 'Notes'),
                maxLines: 4),
            const SizedBox(height: 20),
            if (error != null) ...[
              Text(error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
              const SizedBox(height: 12),
            ],
            FilledButton(
              onPressed: submitting ? null : submit,
              child:
                  Text(submitting ? 'Submitting...' : 'Submit audit request'),
            ),
          ],
        ),
      ),
    );
  }
}

String? required(String? value) =>
    value == null || value.trim().isEmpty ? 'Required' : null;
