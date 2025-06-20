import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../services/storage_service.dart';
import '../utils/app_colors.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController senhaController = TextEditingController();
  bool isLoading = false;
  String? errorMessage;

  Future<void> login() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    final url = Uri.parse('http://localhost:8080/auth/login');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': emailController.text,
          'password': senhaController.text,
        }),
      );

      setState(() => isLoading = false);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);

        final token = data['access_token'];
        if (token == null) {
          setState(() {
            errorMessage = 'Resposta inválida do servidor.';
          });
          return;
        }

        Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
        await StorageService.saveUserData(
          token: token,
          userId: decodedToken['sub'].toString(),
          userName: decodedToken['name'] ?? 'Usuário',
          email: decodedToken['email'] ?? '',
        );

        String? userId = decodedToken['sub']?.toString();
        String userName = decodedToken['name'] ?? 'Usuário';

        if (userId == null) {
          setState(() {
            errorMessage = 'ID do usuário não encontrado no token.';
          });
          return;
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('userName', userName);
        await prefs.setString('userId', userId);

        if (!mounted) return;
        Navigator.of(context).pushNamed('/');
      } else {
        setState(() {
          errorMessage = 'Email ou senha inválidos.';
        });
      }
    } catch (e) {
      print('Erro: $e');
      setState(() {
        isLoading = false;
        errorMessage = 'Erro ao conectar com o servidor.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    final backgroundColor = isDark
        ? AppColors.primaryBgColor
        : AppColors.lightPrimaryBgColor;

    final primaryPurple = isDark
        ? AppColors.primaryPurple
        : AppColors.lightPrimaryPurple;
    final primaryFontColor = isDark
        ? AppColors.primaryFontColor
        : AppColors.lightPrimaryFontColor;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: IconButton(
                icon: Icon(Icons.arrow_back, color: primaryPurple),
                onPressed: () {
                  Navigator.of(context).pop();
                },
                tooltip: 'Voltar',
              ),
            ),

            Expanded(
              child: Center(
                child: Container(
                  width: 320,
                  padding: const EdgeInsets.all(30),
                  decoration: BoxDecoration(
                    color: backgroundColor,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 0),
                      ),
                    ],
                    border: Border.all(color: primaryPurple, width: 3),
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          "Login",
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: primaryFontColor,
                          ),
                        ),

                        const SizedBox(height: 25),

                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "Email:",
                            style: TextStyle(
                              color: primaryFontColor,
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        TextField(
                          controller: emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 10,
                            ),
                            filled: true,
                            fillColor: backgroundColor,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(5),
                              borderSide: BorderSide(
                                color: primaryPurple,
                                width: 2,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(5),
                              borderSide: BorderSide(
                                color: primaryPurple,
                                width: 2,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(5),
                              borderSide: BorderSide(
                                color: primaryPurple.withOpacity(0.8),
                                width: 2,
                              ),
                            ),
                            hintText: 'Digite seu email',
                            hintStyle: TextStyle(
                              color: primaryPurple.withOpacity(0.7),
                            ),
                          ),
                          style: TextStyle(color: primaryPurple),
                        ),

                        const SizedBox(height: 20),

                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "Senha:",
                            style: TextStyle(
                              color: primaryFontColor,
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        TextField(
                          controller: senhaController,
                          obscureText: true,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 10,
                            ),
                            filled: true,
                            fillColor: backgroundColor,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(5),
                              borderSide: BorderSide(
                                color: primaryPurple,
                                width: 2,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(5),
                              borderSide: BorderSide(
                                color: primaryPurple,
                                width: 2,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(5),
                              borderSide: BorderSide(
                                color: primaryPurple.withOpacity(0.8),
                                width: 2,
                              ),
                            ),
                            hintText: 'Digite sua senha',
                            hintStyle: TextStyle(
                              color: primaryPurple.withOpacity(0.7),
                            ),
                          ),
                          style: TextStyle(color: primaryPurple),
                        ),

                        const SizedBox(height: 25),

                        if (errorMessage != null)
                          Text(
                            errorMessage!,
                            style: const TextStyle(color: Colors.red),
                          ),

                        isLoading
                            ? const CircularProgressIndicator()
                            : SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: login,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: primaryPurple,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                  ),
                                  child: const Text(
                                    'Entrar',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),

                        TextButton(
                          onPressed: () =>
                              Navigator.of(context).pushNamed('/register'),
                          child: Text(
                            'Criar conta',
                            style: TextStyle(
                              color: primaryPurple,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
