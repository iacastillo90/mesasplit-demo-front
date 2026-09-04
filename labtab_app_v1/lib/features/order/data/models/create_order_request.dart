class CreateOrderRequest {
  final String dineSessionId;
  final String channel;
  final String? notes;
  final List<CreateOrderLineRequest> lines;

  const CreateOrderRequest({
    required this.dineSessionId,
    this.channel = 'QR',
    this.notes,
    required this.lines,
  });

  Map<String, dynamic> toJson() => {
        'dineSessionId': dineSessionId,
        'channel': channel,
        if (notes != null) 'notes': notes,
        'lines': lines.map((e) => e.toJson()).toList(),
      };
}

class CreateOrderLineRequest {
  final String dishId;
  final int quantity;
  final int unitPrice;
  final String? itemNotes;
  final List<ModifierOption> modifiers;
  final String? courseType;
  final String? dineGuestId;

  const CreateOrderLineRequest({
    required this.dishId,
    this.quantity = 1,
    required this.unitPrice,
    this.itemNotes,
    this.modifiers = const [],
    this.courseType,
    this.dineGuestId,
  });

  Map<String, dynamic> toJson() => {
        'dishId': dishId,
        'quantity': quantity,
        'unitPrice': unitPrice,
        if (itemNotes != null) 'itemNotes': itemNotes,
        'modifiers': modifiers.map((e) => e.toJson()).toList(),
        if (courseType != null) 'courseType': courseType,
        if (dineGuestId != null) 'dineGuestId': dineGuestId,
      };
}

class ModifierOption {
  final String? optionId;
  final String? name;
  final int extraPrice;

  const ModifierOption({
    this.optionId,
    this.name,
    this.extraPrice = 0,
  });

  Map<String, dynamic> toJson() => {
        if (optionId != null) 'optionId': optionId,
        if (name != null) 'name': name,
        'extraPrice': extraPrice,
      };
}
