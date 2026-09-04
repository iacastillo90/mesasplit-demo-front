class PageResponse<T> {
  final List<T> content;
  final int page;
  final int size;
  final int totalElements;
  final int totalPages;

  const PageResponse({
    required this.content,
    required this.page,
    required this.size,
    required this.totalElements,
    required this.totalPages,
  });

  factory PageResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) {
    final contentList = (json['content'] as List<dynamic>?)
            ?.map((e) => fromJsonT(e))
            .toList() ??
        [];
    return PageResponse<T>(
      content: contentList,
      page: json['page'] as int? ?? 0,
      size: json['size'] as int? ?? 0,
      totalElements: json['totalElements'] as int? ?? 0,
      totalPages: json['totalPages'] as int? ?? 0,
    );
  }
}
