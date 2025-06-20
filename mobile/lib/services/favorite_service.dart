import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class FavoriteService {
  static const _anonKey = 'favorite_products_anon';
  static const _userKeyPrefix = 'favorite_products_user_';

  static Future<List<Map<String, dynamic>>> getFavorites({
    String? userId,
    String? token,
  }) async {
    if (token != null && userId != null) {
      final response = await http.get(
        Uri.parse('http://localhost:8080/favorites'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map<Map<String, dynamic>>((fav) {
          final product = fav['product'];
          return {
            ...product,
            'id': fav['productId'],
            'provider': fav['provider'],
          };
        }).toList();
      } else {
        throw Exception('Erro ao carregar favoritos');
      }
    } else {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_anonKey);
      if (jsonStr == null) return [];
      final List decoded = jsonDecode(jsonStr);
      return decoded.cast<Map<String, dynamic>>();
    }
  }

  static Future<void> syncAnonymousFavoritesToUser({
    required String userId,
    required String token,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_anonKey);
    if (jsonStr == null) return;

    final List anonFavorites = jsonDecode(jsonStr);

    for (final product in anonFavorites) {
      try {
        final productId = product['id'].toString();
        final provider = product['provider'].toString();

        final isFav = await isFavorite(productId, provider, userId, token);
        if (!isFav) {
          final response = await http.post(
            Uri.parse('http://localhost:8080/favorites'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
            body: jsonEncode({'productId': productId, 'provider': provider}),
          );

          if (response.statusCode != 201 && response.statusCode != 200) {
            print('Falha ao sincronizar favorito: $productId');
          }
        }
      } catch (e) {
        print('Erro ao sincronizar favorito: $e');
      }
    }

    await clearAnonymousFavorites();
  }

  static Future<void> saveFavorites(
    List<Map<String, dynamic>> favorites, {
    String? userId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final key = userId != null ? '$_userKeyPrefix$userId' : _anonKey;
    final jsonStr = jsonEncode(favorites);
    await prefs.setString(key, jsonStr);
  }

  static Future<void> toggleFavorite(
    Map<String, dynamic> product, {
    String? userId,
    String? token,
  }) async {
    final productId = product['id'].toString();
    final provider = product['provider'].toString();

    if (token != null && userId != null) {
      final alreadyFavorited = await isFavorite(
        productId,
        provider,
        userId,
        token,
      );

      if (alreadyFavorited) {
        final response = await http.delete(
          Uri.parse('http://localhost:8080/favorites/$productId/$provider'),
          headers: {'Authorization': 'Bearer $token'},
        );
        if (response.statusCode != 200) {
          throw Exception('Erro ao remover dos favoritos');
        }
      } else {
        final response = await http.post(
          Uri.parse('http://localhost:8080/favorites'),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'productId': productId, 'provider': provider}),
        );
        if (response.statusCode != 201 && response.statusCode != 200) {
          throw Exception('Erro ao adicionar aos favoritos');
        }
      }
    } else {
      final favorites = await getFavorites();
      final exists = favorites.any(
        (item) => item['id'].toString() == productId,
      );

      if (exists) {
        favorites.removeWhere((item) => item['id'].toString() == productId);
      } else {
        favorites.add(product);
      }

      await saveFavorites(favorites);
    }
  }

  static Future<bool> isFavorite(
    String productId,
    String provider,
    String userId,
    String token,
  ) async {
    final favorites = await getFavorites(userId: userId, token: token);
    return favorites.any(
      (item) =>
          item['id'].toString() == productId && item['provider'] == provider,
    );
  }

  static Future<void> clearAnonymousFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_anonKey);
  }
}
