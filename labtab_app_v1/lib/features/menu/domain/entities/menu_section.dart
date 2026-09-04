class MenuSection {
  final String id;
  final String name;
  final String? description;
  final int displayOrder;
  final List<Dish> dishes;

  const MenuSection({
    required this.id,
    required this.name,
    this.description,
    required this.displayOrder,
    this.dishes = const [],
  });

  factory MenuSection.fromJson(Map<String, dynamic> json) {
    return MenuSection(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      displayOrder: json['displayOrder'] as int? ?? 0,
      dishes: (json['dishes'] as List<dynamic>?)
              ?.map((e) => Dish.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class Dish {
  final String id;
  final String name;
  final String? description;
  final int price;
  final String? imageUrl;
  final bool isAvailable;
  final List<String> tags;
  final List<String> allergens;
  final int displayOrder;

  const Dish({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    this.isAvailable = true,
    this.tags = const [],
    this.allergens = const [],
    this.displayOrder = 0,
  });

  factory Dish.fromJson(Map<String, dynamic> json) {
    return Dish(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toInt(),
      imageUrl: json['imageUrl'] as String?,
      isAvailable: json['isAvailable'] as bool? ?? true,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      allergens: (json['allergens'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      displayOrder: json['displayOrder'] as int? ?? 0,
    );
  }
}
