import 'dart:io';

import 'dart:async';

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
  late final StreamSubscription<AuthState> authSubscription;
  bool loading = false;
  bool creatingAccount = false;
  bool navigating = false;
  String? error;

  @override
  void initState() {
    super.initState();
    authSubscription =
        Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      if (data.event == AuthChangeEvent.signedIn && mounted) {
        navigateToDashboard();
      }
    });
  }

  @override
  void dispose() {
    authSubscription.cancel();
    fullName.dispose();
    businessName.dispose();
    phone.dispose();
    email.dispose();
    password.dispose();
    super.dispose();
  }

  bool _isNetworkOrConfigurationError(Object exception) {
    final message = exception.toString().toLowerCase();
    return exception is SocketException ||
        message.contains('no address associated with hostname') ||
        message.contains('name resolution') ||
        message.contains('dns') ||
        message.contains('socketexception') ||
        message.contains('failed host lookup') ||
        message.contains('clientexception') ||
        message.contains('network is unreachable') ||
        message.contains('connection failed') ||
        message.contains('failed to connect');
  }

  String _friendlyConnectionError(Object exception) {
    final message = exception.toString().toLowerCase();
    if (message.contains('no address associated with hostname') ||
        message.contains('failed host lookup') ||
        message.contains('name resolution') ||
        message.contains('dns')) {
      return 'Supabase hostname could not be resolved. Check device DNS, internet access, and SUPABASE_URL.';
    }
    if (_isNetworkOrConfigurationError(exception)) {
      return 'Unable to connect to Supabase. Check internet access and Supabase configuration.';
    }
    return 'Unable to complete the request.';
  }

  void navigateToDashboard() {
    if (navigating) return;
    navigating = true;
    Navigator.pushReplacementNamed(context, '/dashboard');
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
      if (mounted) navigateToDashboard();
    } on AuthException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } catch (exception) {
      if (!mounted) return;
      setState(() {
        error = _friendlyConnectionError(exception);
      });
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> submitOAuth(OAuthProvider provider) async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final opened = await auth.signInWithOAuth(provider);
      if (!opened && mounted) {
        setState(() => error = 'Unable to open the OAuth sign-in page.');
      }
    } on AuthException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } catch (exception) {
      if (!mounted) return;
      setState(() {
        error = _friendlyConnectionError(exception);
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
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed:
                    loading ? null : () => submitOAuth(OAuthProvider.google),
                child: const Text('Continue with Google'),
              ),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed:
                    loading ? null : () => submitOAuth(OAuthProvider.github),
                child: const Text('Continue with GitHub'),
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
