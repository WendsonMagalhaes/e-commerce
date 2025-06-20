import '../models/cart_item.dart';

class Purchase {
  final String id;
  final List<CartItem> items;
  final DateTime date;
  final double total;

  Purchase({
    required this.id,
    required this.items,
    required this.date,
    required this.total,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'items': items.map((item) => item.toMap()).toList(),
      'date': date.toIso8601String(),
      'total': total,
    };
  }

  factory Purchase.fromMap(Map<String, dynamic> map) {
    return Purchase(
      id: map['id']?.toString() ?? '', // protege contra null
      items: map['items'] != null
          ? List<CartItem>.from(
              (map['items'] as List<dynamic>).map(
                (item) => CartItem.fromMap(item),
              ),
            )
          : [], // lista vazia se nulo
      date: map['date'] != null
          ? DateTime.tryParse(map['date'].toString()) ?? DateTime.now()
          : DateTime.now(), // valor padrão
      total: map['total'] != null
          ? (map['total'] is int
                ? (map['total'] as int).toDouble()
                : (map['total'] as num).toDouble())
          : 0.0, // padrão 0.0
    );
  }
}
