import 'package:flutter_test/flutter_test.dart';

import 'package:main_street_media_portal/models/business_snapshot.dart';

void main() {
  test('BusinessSnapshot.fromSupabaseRows preserves canonical package mapping and ordering', () {
    final snapshot = BusinessSnapshot.fromSupabaseRows(
      profile: {
        'id': 'profile-1',
        'full_name': 'Ada Lovelace',
        'email': 'ada@example.com',
        'business_name': 'Ada Labs',
        'phone': '555-0100',
        'package_type': 'Reveal',
        'role': 'customer',
      },
      auditRequests: [
        {
          'id': 'audit-older',
          'user_id': 'profile-1',
          'business_name': 'Ada Labs',
          'website': 'https://example.com/older',
          'phone': '555-0100',
          'email': 'older@example.com',
          'business_category': 'services',
          'city': 'Austin',
          'state': 'TX',
          'notes': 'Older request',
          'status': 'pending_review',
          'created_at': '2026-07-10T08:00:00Z',
        },
        {
          'id': 'audit-newer',
          'user_id': 'profile-1',
          'business_name': 'Ada Labs',
          'website': 'https://example.com/newer',
          'phone': '555-0101',
          'email': 'newer@example.com',
          'business_category': 'services',
          'city': 'Austin',
          'state': 'TX',
          'notes': 'Newer request',
          'status': 'needs_review',
          'created_at': '2026-07-12T08:00:00Z',
        },
      ],
      customerReports: [
        {
          'id': 'assigned-hidden',
          'user_id': 'profile-1',
          'report_id': 'report-hidden',
          'assigned_at': '2026-07-13T09:00:00Z',
          'created_at': '2026-07-13T09:00:00Z',
          'reports': [
            {
              'id': 'report-hidden',
              'title': 'Elite only report',
              'report_type': 'local_seo',
              'description': 'Hidden from core access',
              'file_url': null,
              'content': 'Elite content',
              'visibility_package_required': 'Elite',
            },
            {
              'id': 'report-hidden-fallback',
              'title': 'Fallback report',
              'report_type': 'custom',
              'description': 'Not selected',
              'file_url': null,
              'content': 'Fallback content',
              'visibility_package_required': 'core',
            },
          ],
        },
        {
          'id': 'assigned-visible',
          'user_id': 'profile-1',
          'report_id': 'report-visible',
          'assigned_at': '2026-07-11T09:00:00Z',
          'created_at': '2026-07-11T09:00:00Z',
          'reports': {
            'id': 'report-visible',
            'title': 'Visible report',
            'report_type': 'visibility_audit',
            'description': 'Visible on core',
            'file_url': 'https://example.com/report.pdf',
            'content': 'Visible content',
            'visibility_package_required': '197',
          },
        },
      ],
    );

    expect(snapshot.profile.package.canonicalId, 'core');
    expect(snapshot.profile.package.sourceValue, 'Reveal');
    expect(snapshot.profile.package.label, 'Core');
    expect(snapshot.profile.package.priceLabel, r'$197 Visibility');
    expect(snapshot.profile.package.rank, 1);
    expect(snapshot.latestAuditRequest?.id, 'audit-newer');
    expect(snapshot.latestAuditStatusLabel, 'needs review');
    expect(snapshot.reportCount, 2);
    expect(snapshot.reports.first.id, 'report-hidden');
    expect(snapshot.reports.last.id, 'report-visible');
    expect(snapshot.visibleReports.length, 1);
    expect(snapshot.visibleReports.single.id, 'report-visible');
    expect(snapshot.visibleReports.single.requiredPackage.canonicalId, 'core');
  });

  test('BusinessPackage access rules follow canonical rank hierarchy', () {
    final core = BusinessPackage.fromRaw('197');
    final elite = BusinessPackage.fromRaw('Evolve');
    final agentWorkflow = BusinessPackage.fromRaw('397');

    expect(core.canAccess(core), isTrue);
    expect(core.canAccess(elite), isFalse);
    expect(elite.canAccess(core), isTrue);
    expect(elite.canAccess(agentWorkflow), isFalse);
    expect(agentWorkflow.canAccess(elite), isTrue);
    expect(agentWorkflow.canAccess(core), isTrue);
  });
}
