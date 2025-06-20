import 'package:flutter/material.dart';
import '../utils/app_colors.dart';

class ProductCard extends StatelessWidget {
  final String nome;
  final String preco;
  final String imageUrl;
  final bool isFavorited;
  final VoidCallback onPressed;
  final VoidCallback onToggleFavorite;
  final VoidCallback onCardTap;

  const ProductCard({
    super.key,
    required this.nome,
    required this.preco,
    required this.imageUrl,
    required this.isFavorited,
    required this.onPressed,
    required this.onToggleFavorite,
    required this.onCardTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final backgroundColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;

    final borderColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;

    final nameTextColor = isDark
        ? AppColors.secondFontColor
        : AppColors.lightSecondFontColor;

    final iconAndButtonColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;

    final buttonHoverColor = isDark
        ? AppColors.secondPurple
        : AppColors.lightSecondPurple;

    final priceTextColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;

    return GestureDetector(
      onTap: onCardTap,
      child: SizedBox(
        height: 360,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Card(
              color: backgroundColor,
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: borderColor, width: 2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),

                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        imageUrl,
                        height: 140,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 8,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            nome,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: nameTextColor,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const Spacer(),

                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'R\$ ${preco.replaceAll('.', ',')}',
                                style: TextStyle(
                                  color: priceTextColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              ElevatedButton.icon(
                                onPressed: onCardTap,
                                style: ButtonStyle(
                                  backgroundColor:
                                      MaterialStateProperty.resolveWith<Color>((
                                        states,
                                      ) {
                                        if (states.contains(
                                          MaterialState.hovered,
                                        )) {
                                          return buttonHoverColor;
                                        }
                                        if (states.contains(
                                          MaterialState.disabled,
                                        )) {
                                          return iconAndButtonColor.withOpacity(
                                            0.5,
                                          );
                                        }
                                        return iconAndButtonColor;
                                      }),
                                  padding: MaterialStateProperty.all(
                                    const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 8,
                                    ),
                                  ),
                                  shape: MaterialStateProperty.all(
                                    RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                  ),
                                ),
                                icon: const Icon(
                                  Icons.add_shopping_cart,
                                  size: 18,
                                  color: Colors.white,
                                ),
                                label: const Text(''),
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
              top: -5,
              right: -5,
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: backgroundColor,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: Icon(
                    isFavorited ? Icons.favorite : Icons.favorite_border,
                    color: iconAndButtonColor,
                    size: 35,
                  ),
                  onPressed: onToggleFavorite,
                  splashRadius: 20,
                  padding: EdgeInsets.zero,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
