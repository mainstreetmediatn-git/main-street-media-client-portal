import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/audit_request_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/login_screen.dart';
import 'screens/reports_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: '.env');
    final supabaseUrl = dotenv.env['SUPABASE_URL'];
    final supabaseAnonKey = dotenv.env['SUPABASE_ANON_KEY'];

    if (supabaseUrl == null || supabaseUrl.isEmpty) {
      runApp(const StartupErrorApp(
        title: 'Missing Supabase URL',
        message: 'Set SUPABASE_URL in mobile/.env before launching the app.',
      ));
      return;
    }

    if (supabaseAnonKey == null || supabaseAnonKey.isEmpty) {
      runApp(const StartupErrorApp(
        title: 'Missing Supabase key',
        message:
            'Set SUPABASE_ANON_KEY in mobile/.env before launching the app.',
      ));
      return;
    }

    await Supabase.initialize(
      url: supabaseUrl,
      publishableKey: supabaseAnonKey,
    );
    runApp(const PortalApp());
  } on SocketException catch (exception) {
    runApp(StartupErrorApp(
      title: 'Supabase host lookup failed',
      message:
          'The app could not resolve the Supabase hostname during startup.\n\n'
          'Check device DNS, internet access, and SUPABASE_URL.\n\n'
          '${exception.message}',
    ));
  } catch (exception) {
    runApp(StartupErrorApp(
      title: 'Supabase startup failed',
      message: 'The app could not initialize Supabase.\n\n'
          'Check mobile/.env and the current network connection.\n\n'
          '$exception',
    ));
  }
}

class PortalApp extends StatelessWidget {
  const PortalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Main Street Media',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff136f63)),
        useMaterial3: true,
      ),
      routes: {
        '/': (_) => const LoginScreen(),
        '/dashboard': (_) => const DashboardScreen(),
        '/audit': (_) => const AuditRequestScreen(),
        '/reports': (_) => const ReportsScreen(),
      },
    );
  }
}

class StartupErrorApp extends StatelessWidget {
  const StartupErrorApp({
    super.key,
    required this.title,
    required this.message,
  });

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title,
                            style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 12),
                        Text(message),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
