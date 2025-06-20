import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/storage_service.dart';
import '../utils/app_colors.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class CustomHeader extends StatefulWidget {
  final String pageTitle;
  final TextEditingController? searchController;
  final VoidCallback? onMenuTap;
  final VoidCallback? onBack;
  final VoidCallback? onThemeToggle;
  final String currentLanguage;
  final Function(String?)? onLanguageChange;

  const CustomHeader({
    super.key,
    required this.pageTitle,
    this.searchController,
    this.onMenuTap,
    this.onBack,
    this.onThemeToggle,
    this.currentLanguage = 'PT',
    this.onLanguageChange,
  });

  @override
  State<CustomHeader> createState() => _CustomHeaderState();
}

class _CustomHeaderState extends State<CustomHeader> {
  bool isLoggedIn = false;
  String userName = '';
  OverlayEntry? _overlayEntry;

  @override
  void initState() {
    super.initState();
    _loadLoginState();
  }

  Future<void> _logout() async {
    await StorageService.clearUserData();

    setState(() {
      isLoggedIn = false;
      userName = '';
    });

    _toggleAccountMenu();

    Navigator.pushNamed(context, '/', arguments: widget.onThemeToggle);
  }

  void _toggleAccountMenu() {
    if (_overlayEntry == null) {
      _overlayEntry = _createOverlayEntry();
      Overlay.of(context).insert(_overlayEntry!);
    } else {
      _overlayEntry?.remove();
      _overlayEntry = null;
    }
  }

  Future<void> _loadLoginState() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final name = prefs.getString('userName');

    setState(() {
      isLoggedIn = token != null;
      userName = name ?? 'Usuário';
    });
  }

  OverlayEntry _createOverlayEntry() {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final backgroundColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;
    final borderColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;
    final titleColor = isDark
        ? AppColors.primaryFontColor
        : AppColors.lightPrimaryFontColor;
    final buttonColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;

    return OverlayEntry(
      builder: (context) => Positioned(
        top: 110,
        right: 10,
        child: Material(
          elevation: 8,
          color: Colors.transparent,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.all(12),
            width: 180,
            decoration: BoxDecoration(
              color: backgroundColor,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.circular(8),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black26,
                  blurRadius: 8,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: isLoggedIn
                  ? [
                      Text(
                        'Bem-vindo, $userName',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: titleColor,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _logout,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: buttonColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          child: const Text(
                            'Sair',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                    ]
                  : [
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            _toggleAccountMenu();
                            Navigator.pushNamed(
                              context,
                              '/login',
                              arguments: widget.onThemeToggle,
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: buttonColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          child: const Text(
                            'Login',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            _toggleAccountMenu();
                            Navigator.pushNamed(
                              context,
                              '/register',
                              arguments: widget.onThemeToggle,
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: buttonColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          child: const Text(
                            'Registrar',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                    ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _overlayEntry?.remove();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final primaryColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;

    final primaryBgColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;

    final borderColor = isDark
        ? AppColors.secondPurple
        : AppColors.lightSecondPurple;

    final searchHintColor = isDark ? Colors.white70 : Colors.white70;
    final searchTextColor = isDark ? Colors.white : Colors.white;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: .5),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (widget.onBack != null)
                IconButton(
                  icon: Icon(Icons.arrow_back, color: primaryColor),
                  onPressed: widget.onBack,
                )
              else if (widget.onMenuTap != null)
                IconButton(
                  icon: FaIcon(FontAwesomeIcons.filter, color: primaryColor),
                  onPressed: widget.onMenuTap,
                )
              else
                const SizedBox(width: 48),
              Text(
                'E-commerce',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: primaryColor,
                ),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 4,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: primaryBgColor,
                      border: Border.all(color: primaryColor, width: 2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButton<String>(
                      value: widget.currentLanguage,
                      isDense: true,
                      items: const [
                        DropdownMenuItem(value: 'PT', child: Text('Português')),
                        DropdownMenuItem(value: 'EN', child: Text('English')),
                      ],
                      onChanged: widget.onLanguageChange,
                      underline: Container(),
                      dropdownColor: primaryBgColor,
                      style: TextStyle(
                        color: primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                      iconEnabledColor: primaryColor,
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      isDark ? Icons.wb_sunny : Icons.nights_stay,
                      color: primaryColor,
                    ),
                    onPressed: widget.onThemeToggle,
                    tooltip: isDark ? 'Modo Claro' : 'Modo Noturno',
                  ),
                ],
              ),
            ],
          ),
        ),

        Container(
          color: primaryColor,
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 1),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: widget.searchController,
                  decoration: InputDecoration(
                    isDense: true,
                    hintText: 'Buscar...',
                    hintStyle: TextStyle(
                      color: searchHintColor,
                      fontWeight: FontWeight.w500,
                    ),
                    suffixIcon: Container(
                      height: 36,
                      width: 36,
                      decoration: BoxDecoration(
                        color: primaryColor,
                        borderRadius: const BorderRadius.only(
                          topRight: Radius.circular(8),
                          bottomRight: Radius.circular(8),
                        ),
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      padding: const EdgeInsets.all(6),
                      child: const Icon(
                        Icons.search,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(
                        color: Colors.white,
                        width: 2,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(
                        color: Colors.white,
                        width: 2,
                      ),
                    ),
                  ),
                  style: TextStyle(color: searchTextColor),
                ),
              ),

              const SizedBox(width: 10),
              IconButton(
                icon: const Icon(Icons.history, color: Colors.white),
                onPressed: () => Navigator.of(
                  context,
                ).pushNamed('/sales', arguments: widget.onThemeToggle),
              ),
              IconButton(
                icon: const Icon(Icons.favorite_border, color: Colors.white),
                onPressed: () => Navigator.of(
                  context,
                ).pushNamed('/favorite', arguments: widget.onThemeToggle),
              ),
              IconButton(
                icon: const Icon(
                  Icons.shopping_cart_outlined,
                  color: Colors.white,
                ),
                onPressed: () => Navigator.of(
                  context,
                ).pushNamed('/cart', arguments: widget.onThemeToggle),
              ),
              IconButton(
                icon: const Icon(Icons.person, color: Colors.white),
                onPressed: _toggleAccountMenu,
              ),
            ],
          ),
        ),

        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: borderColor, width: 2)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                widget.pageTitle,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: primaryColor,
                ),
              ),
              Row(
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(
                      context,
                    ).pushNamed('/', arguments: widget.onThemeToggle),
                    child: Text('Home', style: TextStyle(color: primaryColor)),
                  ),

                  TextButton(
                    onPressed: () => Navigator.of(
                      context,
                    ).pushNamed('/about', arguments: widget.onThemeToggle),
                    child: Text('Sobre', style: TextStyle(color: primaryColor)),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(
                      context,
                    ).pushNamed('/contact', arguments: widget.onThemeToggle),
                    child: Text(
                      'Contato',
                      style: TextStyle(color: primaryColor),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
