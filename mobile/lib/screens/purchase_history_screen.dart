import 'package:flutter/material.dart';
import '../models/purchase.dart';
import '../services/purchase_service.dart';
import '../widgets/header_widget.dart';
import '../../services/storage_service.dart';
import '../utils/app_colors.dart';

class PurchaseHistoryScreen extends StatefulWidget {
  final VoidCallback onThemeToggle;

  const PurchaseHistoryScreen({super.key, required this.onThemeToggle});

  @override
  _PurchaseHistoryScreenState createState() => _PurchaseHistoryScreenState();
}

class _PurchaseHistoryScreenState extends State<PurchaseHistoryScreen> {
  List<Purchase> purchases = [];
  bool isLoading = true;
  String? token;
  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadPurchases();
  }

  Future<void> loadPurchases() async {
    try {
      token = await StorageService.getToken();
      if (token != null) {
        final loadedPurchases = await PurchaseService.fetchPurchases(token!);
        setState(() {
          purchases = loadedPurchases;
          isLoading = false;
        });
      } else {
        setState(() => isLoading = false);
      }
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Erro ao carregar compras: $e')));
    }
  }

  String formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2, '0')}/"
        "${date.month.toString().padLeft(2, '0')}/"
        "${date.year}";
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    final backgroundColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;
    final titleColor = isDark
        ? AppColors.primaryFontColor
        : AppColors.lightPrimaryFontColor;
    final borderColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;
    final subtitleColor = isDark
        ? AppColors.secondFontColor
        : AppColors.lightSecondFontColor;
    final subtitleHighlightColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;
    final overlayColor = isDark
        ? AppColors.bgOverlay
        : AppColors.lightBgOverlay;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Column(
        children: [
          CustomHeader(
            pageTitle: 'Compras',
            onBack: () => Navigator.of(context).pop(),
            searchController: searchController,
            onThemeToggle: widget.onThemeToggle,
            currentLanguage: 'PT',
            onLanguageChange: (lang) {},
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : token == null
                ? Center(
                    child: Text(
                      'Para ver seu histórico de compras, é necessário estar logado.',
                      style: TextStyle(
                        color: titleColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  )
                : purchases.isEmpty
                ? Center(
                    child: Text(
                      'Nenhuma compra realizada ainda.',
                      style: TextStyle(
                        color: titleColor,
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  )
                : ListView.builder(
                    itemCount: purchases.length,
                    itemBuilder: (context, index) {
                      final purchase = purchases[index];
                      return Container(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: overlayColor,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: borderColor, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Theme(
                            data: Theme.of(
                              context,
                            ).copyWith(dividerColor: Colors.transparent),
                            child: ExpansionTile(
                              tilePadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              collapsedBackgroundColor: backgroundColor,
                              backgroundColor: overlayColor,
                              title: Text(
                                'Compra em ${formatDate(purchase.date)}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: titleColor,
                                  fontSize: 16,
                                ),
                              ),
                              trailing: Icon(
                                Icons.expand_more,
                                color: subtitleHighlightColor,
                              ),
                              subtitle: Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  'Total: R\$ ${purchase.total.toStringAsFixed(2).replaceAll('.', ',')}',
                                  style: TextStyle(
                                    color: subtitleHighlightColor,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                              childrenPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 1,
                              ),
                              children: [
                                Divider(
                                  color: borderColor,
                                  thickness: 1,
                                  height: 1,
                                ),
                                ...purchase.items.map((item) {
                                  final price =
                                      double.tryParse(
                                        item.product['price'].toString(),
                                      ) ??
                                      0.0;
                                  final totalItem = price * item.quantity;
                                  return Container(
                                    margin: const EdgeInsets.symmetric(
                                      vertical: 6,
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Align(
                                            alignment: Alignment.centerLeft,
                                            child: Text(
                                              item.product['name'],
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w500,
                                                color: titleColor,
                                              ),
                                            ),
                                          ),
                                        ),
                                        Expanded(
                                          child: Align(
                                            alignment: Alignment.center,
                                            child: Text(
                                              '${item.quantity} x R\$ ${price.toStringAsFixed(2).replaceAll('.', ',')}',
                                              style: TextStyle(
                                                color: subtitleColor,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ),
                                        ),
                                        Expanded(
                                          child: Align(
                                            alignment: Alignment.centerRight,
                                            child: Text(
                                              'Subtotal: R\$ ${totalItem.toStringAsFixed(2).replaceAll('.', ',')}',
                                              style: TextStyle(
                                                fontWeight: FontWeight.w600,
                                                color: subtitleHighlightColor,
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
