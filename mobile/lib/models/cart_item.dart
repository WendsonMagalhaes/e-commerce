import 'dart:convert';

class CartItem {
  final String id;
  final Map<String, dynamic> product;
  int quantity;
  bool selected;

  CartItem({
    required this.id,
    required this.product,
    this.quantity = 1,
    this.selected = true,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'product': product,
    'quantity': quantity,
    'selected': selected,
  };

  factory CartItem.fromMap(Map<String, dynamic> map) {
    return CartItem(
      id: map['id'].toString(),
      product: Map<String, dynamic>.from(map['product']),
      quantity: map['quantity'] ?? 1,
      selected: map['selected'] ?? true,
    );
  }

  String toJson() => json.encode(toMap());

  // Só use se precisar codificar/decodificar JSON como string
  factory CartItem.fromJson(String source) =>
      CartItem.fromMap(json.decode(source));
}
