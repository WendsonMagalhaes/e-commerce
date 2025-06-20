import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item.dart';
import 'package:http/http.dart' as http;

class CartService {
  static const _anonymousCartKey = 'cart_items_anon';
  static const _userCartKeyPrefix = 'cart_items_user_';

  static Future<void> saveCart(List<CartItem> items, {String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    final key = userId == null
        ? _anonymousCartKey
        : '$_userCartKeyPrefix$userId';
    final jsonStr = jsonEncode(items.map((e) => e.toJson()).toList());
    await prefs.setString(key, jsonStr);
  }

  static Future<List<CartItem>> loadCart({String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    final key = userId == null
        ? _anonymousCartKey
        : '$_userCartKeyPrefix$userId';
    final jsonStr = prefs.getString(key);
    if (jsonStr == null) return [];
    final List<dynamic> decoded = jsonDecode(jsonStr);
    return decoded.map((e) => CartItem.fromJson(e)).toList();
  }

  static Future<void> clearAnonymousCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_anonymousCartKey);
  }

  static Future<void> clearUserCart(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_userCartKeyPrefix$userId');
  }

  static Future<List<CartItem>> fetchCartFromApi(String token) async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:8080/cart'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        List<dynamic> items = data['items'];
        List<CartItem> cartItems = items
            .map((item) => CartItem.fromMap(item))
            .toList();

        return cartItems;
      } else {
        throw Exception('Erro ao carregar carrinho: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erro ao carregar carrinho: $e');
    }
  }

  static Future<void> addItemToApi(String token, CartItem item) async {
    final product = item.product;
    final productId = product['id'];
    final productProvider = product['provider'];
    final quantity = item.quantity;

    final response = await http.post(
      Uri.parse('http://localhost:8080/cart/add'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'productId': productId,
        'productProvider': productProvider,
        'quantity': quantity,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Erro ao adicionar item no backend');
    }
  }

  static Future<void> mergeAnonymousCartIntoUserCart(
    String userId,
    String token,
  ) async {
    final anonItems = await loadCart(userId: null);
    if (anonItems.isEmpty) return;

    for (final item in anonItems) {
      await addItemToApi(token, item);
    }

    await clearAnonymousCart();
  }

  static Future<void> addItem(CartItem newItem, {String? userId}) async {
    final items = await loadCart(userId: userId);

    final index = items.indexWhere(
      (item) => item.product['id'] == newItem.product['id'],
    );

    if (index != -1) {
      items[index].quantity += newItem.quantity;
    } else {
      items.add(newItem);
    }

    await saveCart(items, userId: userId);
  }

  static Future<void> updateQuantity({
    required String? userId,
    required String? token,
    required String productId,
    required int newQuantity,
  }) async {
    if (token != null) {
      final response = await http.patch(
        Uri.parse('http://localhost:8080/cart/item/$productId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'quantity': newQuantity}),
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception(
          'Erro ao atualizar item no backend. Código: ${response.statusCode}. Resposta: ${response.body}',
        );
      }
    } else {
      final items = await loadCart();
      final index = items.indexWhere((i) => i.product['id'] == productId);
      if (index != -1) {
        items[index].quantity = newQuantity;
        await saveCart(items);
      }
    }
  }

  static Future<void> selectItem({
    required String? userId,
    required String? token,
    required String productId,
    required bool selected,
  }) async {
    if (token != null) {
      final response = await http.patch(
        Uri.parse('http://localhost:8080/cart/item/$productId/select'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'selected': selected}),
      );

      if (response.statusCode < 200 || response.statusCode >= 300) {
        print(
          'Erro ao selecionar item: ${response.statusCode} - ${response.body}',
        );
        throw Exception('Erro ao selecionar item no backend');
      }
    } else {
      final items = await loadCart();
      final index = items.indexWhere((i) => i.product['id'] == productId);
      if (index != -1) {
        items[index].selected = selected;
        await saveCart(items);
      }
    }
  }

  static Future<void> removeItem({
    required String? userId,
    required String? token,
    required String productId,
  }) async {
    if (token != null) {
      final response = await http.delete(
        Uri.parse('http://localhost:8080/cart/item/$productId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception('Erro ao remover item do backend');
      }
    } else {
      final items = await loadCart();
      final updatedItems = items
          .where((i) => i.product['id'] != productId)
          .toList();
      await saveCart(updatedItems);
    }
  }

  static Future<List<CartItem>> getCart({
    required String? userId,
    required String? token,
  }) async {
    if (token != null) {
      return await fetchCartFromApi(token);
    } else {
      return await loadCart();
    }
  }
}
