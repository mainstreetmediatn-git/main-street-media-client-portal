import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  static const oauthRedirectTo = 'com.mainstreetmedia.portal://login-callback';

  final SupabaseClient _client = Supabase.instance.client;

  Future<AuthResponse> signIn(String email, String password) {
    return _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
    required String fullName,
    required String businessName,
    required String phone,
  }) async {
    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: {
        'full_name': fullName,
        'business_name': businessName,
        'phone': phone,
      },
    );

    return response;
  }

  Future<void> signOut() => _client.auth.signOut();

  Future<bool> signInWithOAuth(OAuthProvider provider) {
    return _client.auth.signInWithOAuth(
      provider,
      redirectTo: oauthRedirectTo,
    );
  }
}
