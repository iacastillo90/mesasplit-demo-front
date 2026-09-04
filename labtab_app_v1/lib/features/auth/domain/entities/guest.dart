class Guest {
  final String id;
  final String displayName;
  final String dineSessionId;
  final String tableId;
  final String? tableName;

  const Guest({
    required this.id,
    required this.displayName,
    required this.dineSessionId,
    required this.tableId,
    this.tableName,
  });

  factory Guest.fromJson(Map<String, dynamic> json) {
    return Guest(
      id: json['id'] as String,
      displayName: json['displayName'] as String,
      dineSessionId: json['dineSessionId'] as String,
      tableId: json['tableId'] as String,
      tableName: json['tableName'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'displayName': displayName,
        'dineSessionId': dineSessionId,
        'tableId': tableId,
        'tableName': tableName,
      };
}
