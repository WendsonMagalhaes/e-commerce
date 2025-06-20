import 'package:flutter/material.dart';
import '../widgets/header_widget.dart';
import '../services/cart_service.dart';
import '../models/cart_item.dart';
import '../utils/app_colors.dart';
import '../widgets/modal_message_widget.dart';

class ProductDetailScreen extends StatefulWidget {
  final dynamic product;
  final bool? isFavorited;
  final VoidCallback? onToggleFavorite;
  final VoidCallback? onThemeToggle;

  const ProductDetailScreen({
    super.key,
    required this.product,
    this.isFavorited,
    this.onToggleFavorite,
    this.onThemeToggle,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final TextEditingController searchController = TextEditingController();
  int quantity = 1;

  bool _isModalVisible = false;
  String _modalTitle = '';
  String _modalMessage = '';
  ModalType _modalType = ModalType.success;

  void incrementQuantity() => setState(() => quantity++);
  void decrementQuantity() => setState(() {
    if (quantity > 1) quantity--;
  });

  void _showModal(String title, String message, ModalType type) {
    setState(() {
      _modalTitle = title;
      _modalMessage = message;
      _modalType = type;
      _isModalVisible = true;
    });
  }

  void _closeModal() {
    setState(() {
      _isModalVisible = false;
    });
  }

  Future<void> addToCart() async {
    await CartService.addItem(
      CartItem(
        id: widget.product['id'].toString(),
        product: widget.product,
        quantity: quantity,
      ),
    );

    _showModal('Sucesso', 'Produto adicionado ao carrinho!', ModalType.success);

    await Future.delayed(const Duration(milliseconds: 500));
    _closeModal();

    Navigator.of(context).pushNamed('/');
  }

  @override
  Widget build(BuildContext context) {
    final nome = widget.product['name'] ?? 'Produto';
    final preco = double.tryParse(widget.product['price'].toString()) ?? 0.0;
    final precoFormatado = preco.toStringAsFixed(2).replaceAll('.', ',');
    final imageUrl = widget.product['gallery']?[0];
    final descricao = widget.product['description'] ?? 'Sem descrição';
    final departamento = widget.product['department'] ?? 'N/A';
    final categoria = widget.product['category'] ?? 'N/A';
    final material = widget.product['material'] ?? 'N/A';

    final isDark = Theme.of(context).brightness == Brightness.dark;

    final backgroundColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;
    final titleColor = isDark
        ? AppColors.primaryFontColor
        : AppColors.lightPrimaryFontColor;
    final iconColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;
    final subtitleColor = isDark
        ? AppColors.secondPurple
        : AppColors.lightSecondPurple;

    return Stack(
      children: [
        Scaffold(
          backgroundColor: backgroundColor,
          body: SafeArea(
            child: Column(
              children: [
                CustomHeader(
                  pageTitle: 'Detalhes',
                  onBack: () => Navigator.of(context).pop(),
                  searchController: searchController,
                  onThemeToggle: widget.onThemeToggle,
                  currentLanguage: 'PT',
                  onLanguageChange: (lang) {},
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              imageUrl,
                              height: 200,
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                nome,
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: titleColor,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: Icon(
                                widget.isFavorited ?? false
                                    ? Icons.favorite
                                    : Icons.favorite_border,
                                color: iconColor,
                              ),
                              onPressed: widget.onToggleFavorite,
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'R\$ $precoFormatado',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: subtitleColor,
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  onPressed: decrementQuantity,
                                  icon: Icon(
                                    Icons.remove_circle_outline,
                                    color: iconColor,
                                  ),
                                ),
                                Text(
                                  quantity.toString(),
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                IconButton(
                                  onPressed: incrementQuantity,
                                  icon: Icon(
                                    Icons.add_circle_outline,
                                    color: iconColor,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: addToCart,
                            icon: const Icon(Icons.add_shopping_cart),
                            label: const Text('Adicionar ao carrinho'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: iconColor,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Descrição:',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 6),
                        Text(descricao),
                        const SizedBox(height: 20),
                        Text(
                          'Ficha Técnica:',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 6),
                        Text('Departamento: $departamento'),
                        Text('Categoria: $categoria'),
                        Text('Material: $material'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (_isModalVisible)
          ModalMessage(
            title: _modalTitle,
            message: _modalMessage,
            type: _modalType,
            onClose: _closeModal,
          ),
      ],
    );
  }
}
