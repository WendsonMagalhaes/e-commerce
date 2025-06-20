import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/purchase.dart';
import 'package:http/http.dart' as http;

class PurchaseService {
  static const _anonymousPurchaseKey = 'purchase_history_anon';
  static const _userPurchaseKeyPrefix = 'purchase_history_user_';

  static Future<List<Purchase>> loadPurchases({String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    final key = userId == null
        ? _anonymousPurchaseKey
        : '$_userPurchaseKeyPrefix$userId';
    final jsonStr = prefs.getString(key);
    if (jsonStr == null) return [];
    final List<dynamic> decoded = jsonDecode(jsonStr);
    return decoded.map((e) => Purchase.fromMap(e)).toList();
  }

  static Future<void> clearLocalHistory({String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    final key = userId == null
        ? _anonymousPurchaseKey
        : '$_userPurchaseKeyPrefix$userId';
    await prefs.remove(key);
  }

  static Future<List<Purchase>> fetchPurchases(String token) async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:8080/sales'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> decoded = jsonDecode(response.body);
        return decoded.map((e) => Purchase.fromMap(e)).toList();
      } else {
        throw Exception(
          'Erro ao carregar compras do backend: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Erro ao carregar compras: $e');
    }
  }

  static Future<void> finalizePurchase(
    String token,
    List<Map<String, dynamic>> selectedItems,
  ) async {
    final response = await http.post(
      Uri.parse('http://localhost:8080/sales/finalize'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'items': selectedItems}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Erro ao finalizar compra: ${response.statusCode}');
    }
  }
}
