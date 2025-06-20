import 'package:flutter/material.dart';
import '../utils/app_colors.dart';
import '../widgets/header_widget.dart';

class AboutScreen extends StatefulWidget {
  final VoidCallback onThemeToggle;

  const AboutScreen({super.key, required this.onThemeToggle});

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  final TextEditingController searchController = TextEditingController();
  bool isLoading = true;

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

    final paragraphColor = isDark
        ? AppColors.secondFontColor
        : AppColors.lightSecondFontColor;

    final listItemColor = isDark
        ? AppColors.thirdFontColor
        : AppColors.lightThirdFontColor;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            CustomHeader(
              pageTitle: 'Sobre',
              searchController: searchController,
              onMenuTap: () => Scaffold.of(context).openDrawer(),
              onThemeToggle: widget.onThemeToggle,
              currentLanguage: 'PT',
              onLanguageChange: (lang) {},
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionTitle('Sobre o Projeto', titleColor),
                    _buildParagraph(
                      'Este projeto é uma plataforma de e-commerce desenvolvida para facilitar a navegação, '
                      'visualização e compra de produtos de forma prática e moderna. '
                      'É possível explorar itens de diferentes fornecedores, aplicar filtros, favoritar produtos e realizar pedidos.',
                      paragraphColor,
                    ),
                    _buildParagraph(
                      'Os pedidos são registrados e armazenados, permitindo consulta posterior. '
                      'A interface é responsiva e pensada para funcionar bem em diferentes dispositivos.',
                      paragraphColor,
                    ),
                    const SizedBox(height: 24),
                    _buildSectionTitle(
                      'Funcionalidades principais',
                      titleColor,
                    ),
                    _buildBulletList([
                      'Busca por nome, categoria, material, fornecedor e preço',
                      'Visualização detalhada de produtos com imagem e descrição',
                      'Favoritar produtos',
                      'Adicionar ao carrinho com controle de quantidade',
                      'Finalização de pedidos com persistência',
                      'Interface responsiva e moderna',
                    ], listItemColor),
                    const SizedBox(height: 24),
                    _buildSectionTitle(
                      'Fontes dos Produtos (APIs)',
                      titleColor,
                    ),
                    _buildParagraph('Fornecedor Brasileiro:', titleColor),
                    _buildCodeBox(
                      'GET http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider',
                      paragraphColor,
                    ),
                    _buildCodeBox(
                      'GET http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider/:id',
                      paragraphColor,
                    ),
                    const SizedBox(height: 12),
                    _buildParagraph('Fornecedor Europeu:', titleColor),
                    _buildCodeBox(
                      'GET http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider',
                      paragraphColor,
                    ),
                    _buildCodeBox(
                      'GET http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider/:id',
                      paragraphColor,
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

  Widget _buildSectionTitle(String text, Color color) {
    return Text(
      text,
      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color),
    );
  }

  Widget _buildParagraph(String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Text(
        text,
        style: TextStyle(fontSize: 16, height: 1.5, color: color),
      ),
    );
  }

  Widget _buildBulletList(List<String> items, Color color) {
    return Column(
      children: items
          .map(
            (item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• ', style: TextStyle(fontSize: 18)),
                  Expanded(
                    child: Text(
                      item,
                      style: TextStyle(fontSize: 16, color: color),
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildCodeBox(String text, Color color) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.black12,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(fontFamily: 'monospace', fontSize: 14, color: color),
      ),
    );
  }
}
