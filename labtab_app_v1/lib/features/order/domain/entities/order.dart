class Order {
  final String id;
  final String status;
  final int subtotal;
  final int total;
  final int itemCount;
  final List<OrderLine> lines;
  final String? kitchenTicketId;

  const Order({
    required this.id,
    required this.status,
    required this.subtotal,
    required this.total,
    required this.itemCount,
    this.lines = const [],
    this.kitchenTicketId,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      status: json['status'] as String,
      subtotal: (json['subtotal'] as num).toInt(),
      total: (json['total'] as num).toInt(),
      itemCount: json['itemCount'] as int? ?? 0,
      lines: (json['lines'] as List<dynamic>?)
              ?.map((e) => OrderLine.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      kitchenTicketId: json['kitchenTicketId'] as String?,
    );
  }
}

class OrderLine {
  final String id;
  final String? name;
  final int quantity;
  final String status;
  final String? dishName;
  final int? unitPrice;

  const OrderLine({
    required this.id,
    this.name,
    this.quantity = 1,
    required this.status,
    this.dishName,
    this.unitPrice,
  });

  factory OrderLine.fromJson(Map<String, dynamic> json) {
    return OrderLine(
      id: json['id'] as String,
      name: json['name'] as String?,
      quantity: json['quantity'] as int? ?? 1,
      status: json['status'] as String,
      dishName: json['dishName'] as String?,
      unitPrice: json['unitPrice'] != null
          ? (json['unitPrice'] as num).toInt()
          : null,
    );
  }
}
