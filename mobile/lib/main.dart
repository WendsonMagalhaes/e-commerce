import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/favorite_screen.dart';
import 'screens/purchase_history_screen.dart';
import 'screens/about_screen.dart';
import 'screens/contact_screen.dart';
import 'utils/app_colors.dart';

class MeuApp extends StatefulWidget {
  const MeuApp({super.key});

  @override
  State<MeuApp> createState() => _MeuAppState();
}

class _MeuAppState extends State<MeuApp> {
  bool isDarkTheme = false;

  void toggleTheme() {
    setState(() {
      isDarkTheme = !isDarkTheme;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'E-commerce App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: AppColors.lightPrimaryPurple,
        scaffoldBackgroundColor: AppColors.lightPrimaryBgColor,
        colorScheme: ColorScheme.light(
          primary: AppColors.lightPrimaryPurple,
          secondary: AppColors.lightSecondPurple,
          background: AppColors.lightPrimaryBgColor,
          onBackground: AppColors.lightSecondFontColor,
        ),
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: AppColors.secondPurple,
        scaffoldBackgroundColor: AppColors.primaryBgColor,
        colorScheme: ColorScheme.dark(
          primary: AppColors.secondPurple,
          secondary: AppColors.primaryPurple,
          background: AppColors.primaryBgColor,
          onBackground: AppColors.secondFontColor,
        ),
      ),
      themeMode: isDarkTheme ? ThemeMode.dark : ThemeMode.light,
      initialRoute: '/',
      routes: {
        '/': (context) => HomeScreen(onThemeToggle: toggleTheme),
        '/login': (context) => LoginScreen(),
        '/register': (context) => RegisterScreen(),
        '/cart': (context) => CartScreen(onThemeToggle: toggleTheme),
        '/favorite': (context) => FavoriteScreen(onThemeToggle: toggleTheme),
        '/sales': (context) =>
            PurchaseHistoryScreen(onThemeToggle: toggleTheme),
        '/about': (context) => AboutScreen(onThemeToggle: toggleTheme),
        '/contact': (context) => ContactScreen(onThemeToggle: toggleTheme),
      },
    );
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MeuApp());
}
