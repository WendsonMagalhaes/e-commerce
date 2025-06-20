import 'package:flutter/material.dart';
import '../services/favorite_service.dart';
import '../services/storage_service.dart';
import '../widgets/product_card_widget.dart';
import '../widgets/header_widget.dart';
import '../utils/app_colors.dart';

class FavoriteScreen extends StatefulWidget {
  final VoidCallback onThemeToggle;

  const FavoriteScreen({super.key, required this.onThemeToggle});
  @override
  State<FavoriteScreen> createState() => _FavoriteScreenState();
}

class _FavoriteScreenState extends State<FavoriteScreen> {
  List<Map<String, dynamic>> favorites = [];
  Set<String> favoritosIds = {};
  bool isLoading = true;

  String? userId;
  String? token;

  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadFavorites();
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  Future<void> loadFavorites() async {
    setState(() => isLoading = true);

    token = await StorageService.getToken();
    userId = await StorageService.getUserId();

    final items = await FavoriteService.getFavorites(
      userId: userId,
      token: token,
    );

    setState(() {
      favorites = items;
      favoritosIds = items
          .map((p) => "${p['provider'] ?? ''}-${p['id']}")
          .toSet();
      isLoading = false;
    });
  }

  void toggleFavorite(Map<String, dynamic> product) async {
    await FavoriteService.toggleFavorite(product, userId: userId, token: token);
    await loadFavorites();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final titleColor = isDark
        ? AppColors.primaryFontColor
        : AppColors.lightPrimaryFontColor;

    return Scaffold(
      body: Column(
        children: [
          CustomHeader(
            pageTitle: 'Favoritos',
            onBack: () => Navigator.of(context).pop(),
            searchController: searchController,
            onThemeToggle: widget.onThemeToggle,
            currentLanguage: 'PT',
            onLanguageChange: (lang) {},
          ),
          Expanded(
            child: favorites.isEmpty
                ? Center(
                    child: Text(
                      'Você ainda não adicionou nenhum produto aos favoritos.',
                      style: TextStyle(
                        color: titleColor,
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(10),
                    itemCount: favorites.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 3 / 4.6,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                    itemBuilder: (context, index) {
                      final produto = favorites[index];
                      final id =
                          "${produto['provider'] ?? ''}-${produto['id']}";

                      return ProductCard(
                        nome: produto['nome'] ?? produto['name'] ?? 'Produto',
                        preco: (produto['preco'] ?? produto['price'] ?? '0')
                            .toString(),
                        imageUrl: produto['gallery']?[0],
                        isFavorited: favoritosIds.contains(id),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Produto adicionado ao carrinho'),
                            ),
                          );
                        },
                        onToggleFavorite: () => toggleFavorite(produto),
                        onCardTap: () {},
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
