import 'package:flutter/material.dart';
import '../widgets/header_widget.dart';
import '../utils/app_colors.dart';

class ContactScreen extends StatelessWidget {
  final VoidCallback onThemeToggle;

  const ContactScreen({super.key, required this.onThemeToggle});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final backgroundColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;
    final titleColor = isDark
        ? AppColors.primaryFontColor
        : AppColors.lightPrimaryFontColor;
    final fieldColor = isDark
        ? AppColors.secondFontColor
        : AppColors.lightSecondFontColor;
    final borderColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;
    final hintColor = isDark
        ? AppColors.thirdFontColor
        : AppColors.lightThirdFontColor;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            CustomHeader(
              pageTitle: 'Contato',
              onMenuTap: () => Scaffold.of(context).openDrawer(),
              searchController: null,
              onThemeToggle: onThemeToggle,
              currentLanguage: 'PT',
              onLanguageChange: null,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Fale Conosco',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: titleColor,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Tem alguma dúvida, sugestão ou precisa de suporte? Preencha o formulário abaixo e entraremos em contato com você.',
                      style: TextStyle(
                        fontSize: 16,
                        height: 1.6,
                        color: fieldColor,
                      ),
                    ),
                    const SizedBox(height: 30),

                    _buildTextField(
                      'Nome',
                      'Digite seu nome',
                      borderColor,
                      hintColor,
                      borderColor,
                    ),
                    const SizedBox(height: 20),

                    _buildTextField(
                      'Email',
                      'Digite seu e-mail',
                      borderColor,
                      hintColor,
                      borderColor,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 20),

                    _buildTextField(
                      'Mensagem',
                      'Digite sua mensagem',
                      borderColor,
                      hintColor,
                      borderColor,
                      maxLines: 5,
                    ),
                    const SizedBox(height: 30),

                    Align(
                      alignment: Alignment.centerRight,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: borderColor,
                          padding: const EdgeInsets.symmetric(
                            vertical: 12,
                            horizontal: 24,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text(
                                'Mensagem enviada com sucesso!',
                              ),
                              backgroundColor: borderColor,
                            ),
                          );
                        },
                        child: const Text(
                          'Enviar',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
    String label,
    String hint,
    Color borderColor,
    Color hintColor,
    Color labelColor, {
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: labelColor,
            fontSize: 15,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          keyboardType: keyboardType,
          maxLines: maxLines,
          style: TextStyle(color: borderColor),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: hintColor),
            contentPadding: const EdgeInsets.symmetric(
              vertical: 10,
              horizontal: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(color: borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(color: borderColor.withOpacity(0.8)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(color: borderColor),
            ),
            filled: true,
            fillColor: Colors.transparent,
          ),
        ),
      ],
    );
  }
}
