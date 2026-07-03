import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  final auth = AuthService();
  bool loading = false;

  Future<void> submit({required bool signup}) async {
    setState(() => loading = true);
    try {
      if (signup) {
        await auth.signUp(email.text.trim(), password.text);
      } else {
        await auth.signIn(email.text.trim(), password.text);
      }
      if (mounted) Navigator.pushReplacementNamed(context, '/dashboard');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Main Street Media', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 8),
              const Text('Client visibility portal'),
              const SizedBox(height: 28),
              TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')),
              const SizedBox(height: 12),
              TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
              const SizedBox(height: 20),
              FilledButton(onPressed: loading ? null : () => submit(signup: false), child: const Text('Log in')),
              TextButton(onPressed: loading ? null : () => submit(signup: true), child: const Text('Create account')),
              TextButton(onPressed: () => Navigator.pushNamed(context, '/audit'), child: const Text('Request a free visibility audit')),
            ],
          ),
        ),
      ),
    );
  }
}

