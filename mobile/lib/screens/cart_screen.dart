import 'package:flutter/material.dart';
import '../widgets/cart_item_widget.dart';
import '../widgets/header_widget.dart';
import '../models/cart_item.dart';
import '../services/cart_service.dart';
import '../services/purchase_service.dart';
import '../services/storage_service.dart';
import '../screens/product_detail_screen.dart';
import '../utils/app_colors.dart';
import '../widgets/modal_message_widget.dart';

class CartScreen extends StatefulWidget {
  final VoidCallback onThemeToggle;

  const CartScreen({super.key, required this.onThemeToggle});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<CartItem> cartItems = [];
  bool isLoading = true;
  final TextEditingController searchController = TextEditingController();
  bool selectAll = false;
  String? userId;
  String? token;

  bool _isModalVisible = false;
  String _modalTitle = '';
  String _modalMessage = '';
  ModalType _modalType = ModalType.success;

  @override
  void initState() {
    super.initState();
    _initCart();
  }

  Future<void> _initCart() async {
    setState(() => isLoading = true);
    try {
      token = await StorageService.getToken();
      userId = await StorageService.getUserId();

      if (token != null && userId != null) {
        await CartService.mergeAnonymousCartIntoUserCart(userId!, token!);
        final items = await CartService.fetchCartFromApi(token!);
        setState(() {
          cartItems = items;
          isLoading = false;
          selectAll =
              cartItems.isNotEmpty && cartItems.every((item) => item.selected);
        });
      } else {
        final items = await CartService.loadCart();
        setState(() {
          cartItems = items;
          isLoading = false;
          selectAll =
              cartItems.isNotEmpty && cartItems.every((item) => item.selected);
        });
      }
    } catch (e) {
      setState(() => isLoading = false);
      print('Erro ao carregar carrinho: $e');
    }
  }

  Future<void> _saveCart() async {
    if (userId == null) {
      await CartService.saveCart(cartItems);
    }
  }

  void handleQuantityChange(String id, int newQuantity) async {
    if (newQuantity <= 0) {
      await handleRemove(id);
      return;
    }
    setState(() {
      final index = cartItems.indexWhere((item) => item.id == id);
      if (index != -1) cartItems[index].quantity = newQuantity;
    });

    if (userId != null && token != null) {
      await CartService.updateQuantity(
        userId: userId!,
        token: token!,
        productId: id,
        newQuantity: newQuantity,
      );
    } else {
      await _saveCart();
    }
  }

  Future<void> handleRemove(String id) async {
    setState(() {
      cartItems.removeWhere((item) => item.id == id);
    });

    await CartService.removeItem(userId: userId, token: token, productId: id);

    setState(() {
      selectAll =
          cartItems.isNotEmpty && cartItems.every((item) => item.selected);
    });
  }

  double calculateTotal() {
    return cartItems.where((item) => item.selected).fold(0.0, (sum, item) {
      final price = double.tryParse(item.product['price'].toString()) ?? 0.0;
      return sum + (item.quantity * price);
    });
  }

  int calculateTotalItems() {
    return cartItems
        .where((item) => item.selected)
        .fold(0, (sum, item) => sum + item.quantity);
  }

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

  void handleFinalizePurchase() async {
    final selected = cartItems.where((item) => item.selected).toList();
    if (selected.isEmpty) {
      _showModal('Atenção', 'Selecione ao menos um item', ModalType.warning);
      return;
    }

    if (token == null) {
      _showModal(
        'Erro',
        'Você precisa estar logado para finalizar a compra',
        ModalType.error,
      );
      return;
    }

    setState(() => isLoading = true);
    try {
      final itemsToSend = selected.map((item) {
        return {
          'id': item.id,
          'productId': item.product['id'],
          'quantity': item.quantity,
        };
      }).toList();

      await PurchaseService.finalizePurchase(token!, itemsToSend);

      _showModal(
        'Sucesso',
        'Compra finalizada com sucesso!',
        ModalType.success,
      );

      await Future.delayed(const Duration(milliseconds: 500));
      _closeModal();

      Navigator.of(context).pushNamed('/sales');

      final purchasedIds = selected.map((item) => item.id).toList();

      for (final itemId in purchasedIds) {
        await CartService.removeItem(
          userId: userId,
          token: token,
          productId: itemId,
        );
      }

      setState(() {
        cartItems.removeWhere((item) => purchasedIds.contains(item.id));
        selectAll =
            cartItems.isNotEmpty && cartItems.every((item) => item.selected);
      });

      await _initCart();
    } catch (e) {
      _showModal('Erro', 'Erro ao finalizar compra: $e', ModalType.error);
    } finally {
      setState(() => isLoading = false);
    }
  }

  void toggleSelectAll(bool? value) async {
    final newValue = value ?? false;
    setState(() {
      selectAll = newValue;
      for (var item in cartItems) {
        item.selected = newValue;
      }
    });

    for (var item in cartItems) {
      final productId = item.product['id'];
      await CartService.selectItem(
        userId: userId,
        token: token,
        productId: productId,
        selected: newValue,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;
    final titleColor = isDark
        ? AppColors.primaryFontColor
        : AppColors.lightPrimaryFontColor;
    final subtitleColor = isDark
        ? AppColors.secondFontColor
        : AppColors.lightSecondFontColor;
    final subtitleHighlightColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;
    final backgroundColorButton = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;

    return Stack(
      children: [
        Scaffold(
          backgroundColor: backgroundColor,
          body: Column(
            children: [
              CustomHeader(
                pageTitle: 'Carrinho',
                onBack: () => Navigator.of(context).pop(),
                searchController: searchController,
                onThemeToggle: widget.onThemeToggle,
                currentLanguage: 'PT',
                onLanguageChange: (lang) {},
              ),
              Expanded(
                child: isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : cartItems.isEmpty
                    ? Center(
                        child: Text(
                          'Você ainda não adicionou nenhum produto ao carrinho.',
                          style: TextStyle(
                            color: titleColor,
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      )
                    : Column(
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(top: 16),
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                              color: backgroundColorButton,
                              child: CheckboxListTile(
                                contentPadding: EdgeInsets.zero,
                                title: const Text(
                                  'Selecionar todos os itens',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                value: selectAll,
                                onChanged: toggleSelectAll,
                                controlAffinity:
                                    ListTileControlAffinity.leading,
                                activeColor: Colors.white,
                                checkColor: backgroundColorButton,
                              ),
                            ),
                          ),
                          Expanded(
                            child: ListView.builder(
                              padding: const EdgeInsets.all(12),
                              itemCount: cartItems.length,
                              itemBuilder: (context, index) {
                                final item = cartItems[index];
                                return CartItemWidget(
                                  item: item,
                                  selected: item.selected,
                                  onSelect: (val) async {
                                    final productId = item.id;
                                    setState(() {
                                      item.selected = val ?? false;
                                      selectAll = cartItems.every(
                                        (i) => i.selected,
                                      );
                                    });
                                    await CartService.selectItem(
                                      userId: userId,
                                      token: token,
                                      productId: productId,
                                      selected: item.selected,
                                    );
                                  },
                                  onRemove: () => handleRemove(item.id),
                                  onTapImage: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => ProductDetailScreen(
                                          product: item.product,
                                          onThemeToggle: widget.onThemeToggle,
                                        ),
                                      ),
                                    );
                                  },
                                  onIncrement: () => handleQuantityChange(
                                    item.id,
                                    item.quantity + 1,
                                  ),
                                  onDecrement: () => handleQuantityChange(
                                    item.id,
                                    item.quantity - 1,
                                  ),
                                );
                              },
                            ),
                          ),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            color: backgroundColorButton,
                            child: const Text(
                              'Resumo da Compra',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          Expanded(
                            child: SingleChildScrollView(
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    ...cartItems.where((item) => item.selected).map((
                                      item,
                                    ) {
                                      final preco =
                                          double.tryParse(
                                            item.product['price'].toString(),
                                          ) ??
                                          0.0;
                                      final total = preco * item.quantity;
                                      return ListTile(
                                        title: Text(
                                          item.product['name'],
                                          style: TextStyle(color: titleColor),
                                        ),
                                        subtitle: Text(
                                          '${item.quantity} x R\$ ${preco.toStringAsFixed(2).replaceAll('.', ',')}',
                                          style: TextStyle(
                                            color: subtitleColor,
                                          ),
                                        ),
                                        trailing: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              'R\$ ${total.toStringAsFixed(2).replaceAll('.', ',')}',
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                color: subtitleHighlightColor,
                                              ),
                                            ),
                                            IconButton(
                                              icon: Icon(
                                                Icons.close,
                                                color: subtitleHighlightColor,
                                              ),
                                              tooltip: 'Remover do resumo',
                                              onPressed: () {
                                                setState(() {
                                                  item.selected = false;
                                                  selectAll = cartItems.every(
                                                    (i) => i.selected,
                                                  );
                                                });
                                                _saveCart();
                                              },
                                            ),
                                          ],
                                        ),
                                      );
                                    }),
                                    Divider(
                                      color: subtitleHighlightColor.withOpacity(
                                        0.5,
                                      ),
                                    ),
                                    Text(
                                      'Total de Itens: ${calculateTotalItems()}',
                                      style: TextStyle(color: subtitleColor),
                                    ),
                                    Text(
                                      'Valor Total: R\$ ${calculateTotal().toStringAsFixed(2).replaceAll('.', ',')}',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: titleColor,
                                      ),
                                    ),
                                    const SizedBox(height: 20),
                                    Center(
                                      child: ElevatedButton(
                                        onPressed: handleFinalizePurchase,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              backgroundColorButton,
                                          foregroundColor: Colors.white,
                                          minimumSize: const Size(200, 45),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              5,
                                            ),
                                          ),
                                        ),
                                        child: const Text('Finalizar Compra'),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
              ),
            ],
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
