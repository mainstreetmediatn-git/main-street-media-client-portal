class BusinessSnapshot {
  const BusinessSnapshot({
    required this.profile,
    required this.auditRequests,
    required this.latestAuditRequest,
    required this.reports,
    required this.visibleReports,
    required this.summary,
  });

  final BusinessProfile profile;
  final List<BusinessAuditRequest> auditRequests;
  final BusinessAuditRequest? latestAuditRequest;
  final List<BusinessReport> reports;
  final List<BusinessReport> visibleReports;
  final BusinessSnapshotSummary summary;

  factory BusinessSnapshot.fromSupabaseRows({
    required Map<String, dynamic>? profile,
    required List<Map<String, dynamic>> auditRequests,
    required List<Map<String, dynamic>> customerReports,
  }) {
    final parsedProfile =
        BusinessProfile.fromJson(profile ?? const <String, dynamic>{});
    final parsedAuditRequests = auditRequests
        .map(BusinessAuditRequest.fromJson)
        .toList()
      ..sort((left, right) => right.createdAt.compareTo(left.createdAt));
    final parsedReports = customerReports
        .map(BusinessReport.fromCustomerReportRow)
        .whereType<BusinessReport>()
        .toList()
      ..sort((left, right) => right.assignedAt.compareTo(left.assignedAt));
    final visibleReports = parsedReports
        .where(
            (report) => parsedProfile.package.canAccess(report.requiredPackage))
        .toList();

    return BusinessSnapshot(
      profile: parsedProfile,
      auditRequests: parsedAuditRequests,
      latestAuditRequest:
          parsedAuditRequests.isEmpty ? null : parsedAuditRequests.first,
      reports: parsedReports,
      visibleReports: visibleReports,
      summary: BusinessSnapshotSummary(
        latestAuditStatusLabel: parsedAuditRequests.isEmpty
            ? 'No request submitted'
            : parsedAuditRequests.first.statusLabel,
        packageLabel: parsedProfile.package.label,
        packagePriceLabel: parsedProfile.package.priceLabel,
        assignedReportCount: parsedReports.length,
        visibleReportCount: visibleReports.length,
      ),
    );
  }

  String get latestAuditStatusLabel => summary.latestAuditStatusLabel;

  int get reportCount => summary.assignedReportCount;
}

class BusinessSnapshotSummary {
  const BusinessSnapshotSummary({
    required this.latestAuditStatusLabel,
    required this.packageLabel,
    required this.packagePriceLabel,
    required this.assignedReportCount,
    required this.visibleReportCount,
  });

  final String latestAuditStatusLabel;
  final String packageLabel;
  final String packagePriceLabel;
  final int assignedReportCount;
  final int visibleReportCount;
}

class BusinessProfile {
  const BusinessProfile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.businessName,
    required this.phone,
    required this.package,
    required this.role,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String? fullName;
  final String? email;
  final String? businessName;
  final String? phone;
  final BusinessPackage package;
  final String role;
  final String? createdAt;
  final String? updatedAt;

  factory BusinessProfile.fromJson(Map<String, dynamic> json) {
    return BusinessProfile(
      id: json['id'] as String? ?? '',
      fullName: json['full_name'] as String?,
      email: json['email'] as String?,
      businessName: json['business_name'] as String?,
      phone: json['phone'] as String?,
      package: BusinessPackage.fromRaw(json['package_type'] as String?),
      role: json['role'] as String? ?? 'customer',
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  String get displayName {
    final fullNameFirst = fullName
        ?.trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .firstOrNull;
    if (fullNameFirst != null && fullNameFirst.isNotEmpty) return fullNameFirst;

    final businessFirst = businessName
        ?.trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .firstOrNull;
    if (businessFirst != null && businessFirst.isNotEmpty) return businessFirst;

    return 'there';
  }
}

class BusinessAuditRequest {
  const BusinessAuditRequest({
    required this.id,
    required this.userId,
    required this.businessName,
    required this.website,
    required this.phone,
    required this.email,
    required this.businessCategory,
    required this.city,
    required this.state,
    required this.notes,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String userId;
  final String businessName;
  final String? website;
  final String? phone;
  final String email;
  final String? businessCategory;
  final String? city;
  final String? state;
  final String? notes;
  final String status;
  final String createdAt;
  final String? updatedAt;

  factory BusinessAuditRequest.fromJson(Map<String, dynamic> json) {
    return BusinessAuditRequest(
      id: json['id'] as String? ?? '',
      userId: json['user_id'] as String? ?? '',
      businessName: json['business_name'] as String? ?? '',
      website: json['website'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String? ?? '',
      businessCategory: json['business_category'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      notes: json['notes'] as String?,
      status: json['status'] as String? ?? 'pending',
      createdAt: json['created_at'] as String? ?? '',
      updatedAt: json['updated_at'] as String?,
    );
  }

  String get statusLabel => status.replaceAll('_', ' ');
}

class BusinessReport {
  const BusinessReport({
    required this.id,
    required this.title,
    required this.reportType,
    required this.description,
    required this.requiredPackage,
    required this.createdAt,
    required this.updatedAt,
    required this.assignedAt,
    required this.content,
    required this.fileUrl,
  });

  final String id;
  final String title;
  final String reportType;
  final String description;
  final BusinessPackage requiredPackage;
  final String? createdAt;
  final String? updatedAt;
  final String assignedAt;
  final String? content;
  final String? fileUrl;

  static BusinessReport? fromCustomerReportRow(Map<String, dynamic> json) {
    final nested = json['reports'];
    final reportJson = nested is List
        ? nested.cast<Map<String, dynamic>>().isEmpty
            ? null
            : nested.cast<Map<String, dynamic>>().first
        : nested is Map<String, dynamic>
            ? nested
            : null;

    if (reportJson == null) return null;

    return BusinessReport(
      id: reportJson['id'] as String? ?? '',
      title: reportJson['title'] as String? ?? 'Report',
      reportType: reportJson['report_type'] as String? ?? 'custom',
      description: reportJson['description'] as String? ??
          'Assigned report from Main Street Media Co.',
      requiredPackage: BusinessPackage.fromRaw(
          reportJson['visibility_package_required'] as String?),
      createdAt: reportJson['created_at'] as String?,
      updatedAt: reportJson['updated_at'] as String?,
      assignedAt: json['assigned_at'] as String? ?? '',
      content: reportJson['content'] as String?,
      fileUrl: reportJson['file_url'] as String?,
    );
  }
}

class BusinessPackage {
  const BusinessPackage({
    required this.canonicalId,
    required this.sourceValue,
    required this.label,
    required this.priceLabel,
    required this.rank,
    required this.description,
  });

  final String? canonicalId;
  final String? sourceValue;
  final String label;
  final String priceLabel;
  final int? rank;
  final String? description;

  factory BusinessPackage.fromRaw(String? value) {
    final canonicalId = _canonicalPackageId(value);
    final definition =
        canonicalId == null ? null : _packageDefinitions[canonicalId];

    if (definition == null) {
      return BusinessPackage(
        canonicalId: null,
        sourceValue: value,
        label: 'Pending Assignment',
        priceLabel: 'Pending Assignment',
        rank: null,
        description: value == null || value.isEmpty ? null : value,
      );
    }

    return BusinessPackage(
      canonicalId: canonicalId,
      sourceValue: value,
      label: definition.label,
      priceLabel: definition.numericLabel,
      rank: definition.rank,
      description: definition.description,
    );
  }

  String get sourceLabel {
    final value = sourceValue?.trim();
    if (value == null || value.isEmpty) return label;
    return value;
  }

  bool get hasLegacyAlias {
    final value = sourceValue?.trim();
    if (value == null || value.isEmpty || canonicalId == null) return false;
    final normalized = value.toLowerCase();
    return normalized != canonicalId &&
        normalized != label.toLowerCase() &&
        normalized != priceLabel.toLowerCase();
  }

  String get displayLabel => hasLegacyAlias ? '$label ($sourceLabel)' : label;

  bool canAccess(BusinessPackage requiredPackage) {
    if (rank == null || requiredPackage.rank == null) return false;
    return rank! >= requiredPackage.rank!;
  }
}

class _PackageDefinition {
  const _PackageDefinition({
    required this.id,
    required this.label,
    required this.numericLabel,
    required this.legacyAliases,
    required this.rank,
    required this.description,
  });

  final String id;
  final String label;
  final String numericLabel;
  final List<String> legacyAliases;
  final int rank;
  final String description;
}

const Map<String, _PackageDefinition> _packageDefinitions = {
  'core': _PackageDefinition(
    id: 'core',
    label: 'Core',
    numericLabel: r'$197 Visibility',
    legacyAliases: ['Reveal', '197'],
    rank: 1,
    description:
        'Foundational visibility, audit access, and the core client dashboard surface.',
  ),
  'elite': _PackageDefinition(
    id: 'elite',
    label: 'Elite',
    numericLabel: r'$297 Growth',
    legacyAliases: ['Evolve', '297'],
    rank: 2,
    description:
        'Expanded reporting, growth workflows, and the premium client experience.',
  ),
  'agent_workflow_24_7': _PackageDefinition(
    id: 'agent_workflow_24_7',
    label: 'Agent Workflow 24/7',
    numericLabel: r'$397 Agent Workflow',
    legacyAliases: ['Ascend', '397'],
    rank: 3,
    description:
        'Highest access tier for internal workflow automation and operational handoff.',
  ),
};

final Map<String, String> _packageAliasLookup = {
  for (final entry in _packageDefinitions.entries)
    _normalizePackageKey(entry.key): entry.key,
  for (final entry in _packageDefinitions.entries)
    for (final alias in <String>[
      entry.value.label,
      entry.value.numericLabel,
      ...entry.value.legacyAliases
    ])
      _normalizePackageKey(alias): entry.key,
};

String? _canonicalPackageId(String? value) {
  final normalized = value == null ? null : _normalizePackageKey(value);
  if (normalized == null || normalized.isEmpty) return null;
  return _packageAliasLookup[normalized];
}

String _normalizePackageKey(String value) {
  return value
      .trim()
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9]+'), '_')
      .replaceAll(RegExp(r'_+'), '_')
      .replaceAll(RegExp(r'^_+|_+$'), '');
}

extension FirstOrNullExtension<T> on Iterable<T> {
  T? get firstOrNull {
    final iterator = this.iterator;
    if (!iterator.moveNext()) return null;
    return iterator.current;
  }
}
