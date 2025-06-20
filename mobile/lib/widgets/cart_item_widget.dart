import 'package:flutter/material.dart';
import '../models/cart_item.dart';
import '../utils/app_colors.dart';

class CartItemWidget extends StatelessWidget {
  final CartItem item;
  final bool selected;
  final Function(bool?) onSelect;
  final VoidCallback onRemove;
  final VoidCallback onTapImage;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;

  const CartItemWidget({
    super.key,
    required this.item,
    required this.selected,
    required this.onSelect,
    required this.onRemove,
    required this.onTapImage,
    required this.onIncrement,
    required this.onDecrement,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final product = item.product;
    final name = product['name'] ?? '';
    final description = product['description'] ?? '';
    final price = double.tryParse(product['price'].toString()) ?? 0.0;
    final priceFormatted = price.toStringAsFixed(2).replaceAll('.', ',');
    final imageUrl = (product['gallery'] as List?)?.first ?? '';

    final backgroundColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;

    final borderColor = isDark
        ? AppColors.secondPurple
        : AppColors.lightSecondPurple;

    final textPrimaryColor = isDark
        ? AppColors.secondFontColor
        : AppColors.lightSecondFontColor;

    final textSecondaryColor = isDark
        ? AppColors.secondPurple
        : AppColors.lightSecondPurple;

    final iconColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;

    return Stack(
      children: [
        Container(
          margin: const EdgeInsets.symmetric(vertical: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: backgroundColor,
            border: Border.all(color: borderColor, width: 1),
            borderRadius: BorderRadius.circular(8),
            boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Checkbox(
                value: selected,
                onChanged: onSelect,
                activeColor: iconColor,
                checkColor: backgroundColor,
              ),
              GestureDetector(
                onTap: onTapImage,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(5),
                  child: Image.network(
                    imageUrl,
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 80,
                        height: 80,
                        color: borderColor.withOpacity(0.3),
                        child: Icon(Icons.broken_image, color: iconColor),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: SizedBox(
                  height: 100,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        onTap: onTapImage,
                        child: Text(
                          name,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: textPrimaryColor,
                          ),
                        ),
                      ),
                      Text(
                        description,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontStyle: FontStyle.italic,
                          fontSize: 10,
                          color: textSecondaryColor.withOpacity(0.8),
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'R\$ $priceFormatted',
                            style: TextStyle(
                              color: textSecondaryColor,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                icon: Icon(
                                  Icons.remove_circle_outline,
                                  color: iconColor,
                                ),
                                onPressed: onDecrement,
                              ),
                              Text(
                                '${item.quantity}',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: textPrimaryColor,
                                ),
                              ),
                              IconButton(
                                icon: Icon(
                                  Icons.add_circle_outline,
                                  color: iconColor,
                                ),
                                onPressed: onIncrement,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        Positioned(
          right: 10,
          top: 15,
          child: IconButton(
            onPressed: onRemove,
            icon: Icon(Icons.close, color: iconColor, size: 20),
            splashRadius: 20,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ),
      ],
    );
  }
}
