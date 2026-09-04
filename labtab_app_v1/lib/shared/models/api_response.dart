class ApiResponse<T> {
  final T? data;
  final Meta? meta;
  final ApiError? error;

  const ApiResponse({this.data, this.meta, this.error});

  bool get isSuccess => error == null && data != null;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) {
    final dataJson = json['data'];
    final data = dataJson != null ? fromJsonT(dataJson) : null;
    final metaJson = json['meta'] as Map<String, dynamic>?;
    final errorJson = json['error'] as Map<String, dynamic>?;
    return ApiResponse<T>(
      data: data,
      meta: metaJson != null ? Meta.fromJson(metaJson) : null,
      error: errorJson != null ? ApiError.fromJson(errorJson) : null,
    );
  }
}

class Meta {
  final String? timestamp;
  final String? requestId;

  const Meta({this.timestamp, this.requestId});

  factory Meta.fromJson(Map<String, dynamic> json) {
    return Meta(
      timestamp: json['timestamp'] as String?,
      requestId: json['requestId'] as String?,
    );
  }
}

class ApiError {
  final String? code;
  final String? message;
  final String? detail;
  final String? timestamp;

  const ApiError({this.code, this.message, this.detail, this.timestamp});

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] as String?,
      message: json['message'] as String?,
      detail: json['detail'] as String?,
      timestamp: json['timestamp'] as String?,
    );
  }
}
