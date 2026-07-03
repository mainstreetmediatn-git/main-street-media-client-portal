import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final fullName = TextEditingController();
  final businessName = TextEditingController();
  final phone = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final auth = AuthService();
  bool loading = false;
  bool creatingAccount = false;
  String? error;

  bool _isNetworkOrConfigurationError(Object exception) {
    final message = exception.toString().toLowerCase();
    return message.contains('socketexception') ||
        message.contains('failed host lookup') ||
        message.contains('clientexception') ||
        message.contains('network is unreachable') ||
        message.contains('connection failed') ||
        message.contains('failed to connect');
  }

  Future<void> submit({required bool signup}) async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      if (signup) {
        await auth.signUp(
          email: email.text.trim(),
          password: password.text,
          fullName: fullName.text.trim(),
          businessName: businessName.text.trim(),
          phone: phone.text.trim(),
        );
      } else {
        await auth.signIn(email.text.trim(), password.text);
      }
      if (mounted) Navigator.pushReplacementNamed(context, '/dashboard');
    } on AuthException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } catch (exception) {
      if (!mounted) return;
      setState(() {
        error = _isNetworkOrConfigurationError(exception)
            ? 'Unable to connect to server. Check internet or Supabase configuration.'
            : 'Unable to complete the request.';
      });
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
              Text('Main Street Media',
                  style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 8),
              const Text('Client visibility portal'),
              const SizedBox(height: 28),
              if (creatingAccount) ...[
                TextField(
                    controller: fullName,
                    decoration: const InputDecoration(labelText: 'Full name')),
                const SizedBox(height: 12),
                TextField(
                    controller: businessName,
                    decoration:
                        const InputDecoration(labelText: 'Business name')),
                const SizedBox(height: 12),
                TextField(
                    controller: phone,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(labelText: 'Phone')),
                const SizedBox(height: 12),
              ],
              TextField(
                  controller: email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email')),
              const SizedBox(height: 12),
              TextField(
                  controller: password,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password')),
              const SizedBox(height: 20),
              if (error != null) ...[
                Text(error!,
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.error)),
                const SizedBox(height: 12),
              ],
              FilledButton(
                onPressed:
                    loading ? null : () => submit(signup: creatingAccount),
                child: Text(creatingAccount ? 'Create account' : 'Log in'),
              ),
              TextButton(
                onPressed: loading
                    ? null
                    : () => setState(() => creatingAccount = !creatingAccount),
                child: Text(creatingAccount
                    ? 'I already have an account'
                    : 'Create account'),
              ),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/audit'),
                child: const Text('Request a visibility audit'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
