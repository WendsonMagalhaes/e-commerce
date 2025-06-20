import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/favorite_service.dart';
import '../widgets/header_widget.dart';
import '../widgets/product_card_widget.dart';
import '../widgets/sidebar_widget.dart';
import 'product_detail_screen.dart';
import '../services/storage_service.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback onThemeToggle;

  const HomeScreen({super.key, required this.onThemeToggle});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> produtos = [];
  List<dynamic> produtosFiltrados = [];
  Set<String> favoritos = {};
  bool isLoading = true;
  String? userId;
  String? token;

  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadInitialData();
    searchController.addListener(_filtrarPorTexto);
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  Future<void> fetchProdutos() async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:8080/products/search'),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          produtos = data;
          produtosFiltrados = data;
          isLoading = false;
        });
      } else {
        throw Exception('Erro ao carregar produtos');
      }
    } catch (e) {
      setState(() => isLoading = false);
      print('Erro: $e');
    }
  }

  void _filtrarPorTexto() {
    final query = searchController.text.toLowerCase();

    setState(() {
      if (query.isEmpty) {
        produtosFiltrados = produtos;
      } else {
        produtosFiltrados = produtos.where((produto) {
          final nome = (produto['nome'] ?? produto['name'] ?? '')
              .toString()
              .toLowerCase();
          return nome.contains(query);
        }).toList();
      }
    });
  }

  void _aplicarFiltros(
    Map<String, Set<String>> filtros,
    String? minPrice,
    String? maxPrice,
  ) {
    setState(() {
      produtosFiltrados = produtos.where((produto) {
        bool atende = true;

        filtros.forEach((chave, valores) {
          if (valores.isNotEmpty) {
            final valorProduto = produto[chave]?.toString() ?? '';
            if (!valores.contains(valorProduto)) {
              atende = false;
            }
          }
        });

        final precoRaw = produto['price'] ?? produto['preco'] ?? '0';
        final preco = double.tryParse(precoRaw.toString()) ?? 0.0;

        if (minPrice != null && maxPrice != null) {
          final min = double.tryParse(minPrice) ?? 0.0;
          final max = double.tryParse(maxPrice) ?? double.infinity;
          if (preco < min || preco > max) {
            atende = false;
          }
        }

        return atende;
      }).toList();
    });
  }

  void toggleFavorite(Map<String, dynamic> product) async {
    await FavoriteService.toggleFavorite(product, userId: userId, token: token);

    final favs = await FavoriteService.getFavorites(
      userId: userId,
      token: token,
    );

    setState(() {
      favoritos = favs.map((p) {
        final provider = p['provider'] ?? '';
        final id = p['id'].toString();
        return "$provider-$id";
      }).toSet();
    });
  }

  Future<void> loadInitialData() async {
    setState(() => isLoading = true);

    token = await StorageService.getToken();
    userId = await StorageService.getUserId();

    await fetchProdutos();
    if (userId != null && token != null) {
      await FavoriteService.syncAnonymousFavoritesToUser(
        userId: userId!,
        token: token!,
      );
    }
    final favs = await FavoriteService.getFavorites(
      userId: userId,
      token: token,
    );

    setState(() {
      favoritos = favs.map((p) {
        final provider = p['provider'] ?? '';
        final id = p['id'].toString();
        return "$provider-$id";
      }).toSet();

      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: FilterSidebar(
        allProducts: produtos.cast<Map<String, dynamic>>(),
        onFilterChange: _aplicarFiltros,
      ),
      body: Builder(
        builder: (context) => Column(
          children: [
            CustomHeader(
              pageTitle: 'Home',
              onMenuTap: () => Scaffold.of(context).openDrawer(),
              searchController: searchController,
              onThemeToggle: widget.onThemeToggle,
              currentLanguage: 'PT',
              onLanguageChange: (lang) {},
            ),

            Expanded(
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : GridView.builder(
                      padding: const EdgeInsets.all(10),
                      itemCount: produtosFiltrados.length,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 3 / 4.6,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                          ),
                      itemBuilder: (ctx, index) {
                        final produto = produtosFiltrados[index];
                        final id =
                            "${produto['provider'] ?? ''}-${produto['id']}";

                        return ProductCard(
                          nome: produto['nome'] ?? produto['name'] ?? 'Produto',
                          preco: (produto['preco'] ?? produto['price'] ?? '0')
                              .toString(),
                          imageUrl: produto['gallery']?[0],
                          isFavorited: favoritos.contains(id),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Produto adicionado ao carrinho'),
                              ),
                            );
                          },
                          onToggleFavorite: () => toggleFavorite(produto),
                          onCardTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => ProductDetailScreen(
                                  product: produto,
                                  isFavorited: favoritos.contains(
                                    "${produto['provider'] ?? ''}-${produto['id']}",
                                  ),
                                  onToggleFavorite: () {
                                    toggleFavorite(produto);
                                  },
                                  onThemeToggle: widget.onThemeToggle,
                                ),
                              ),
                            );
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
