import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/app_colors.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController senhaController = TextEditingController();
  final TextEditingController confirmarSenhaController =
      TextEditingController();

  bool isLoading = false;
  String? message;
  bool isSuccess = false;

  Future<void> register() async {
    setState(() {
      isLoading = true;
      message = null;
      isSuccess = false;
    });

    if (senhaController.text != confirmarSenhaController.text) {
      setState(() {
        isLoading = false;
        message = 'As senhas não coincidem.';
        isSuccess = false;
      });
      return;
    }

    final url = Uri.parse('http://localhost:8080/auth/register');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': nameController.text,
          'email': emailController.text,
          'password': senhaController.text,
        }),
      );

      setState(() => isLoading = false);

      if (response.statusCode == 201 || response.statusCode == 200) {
        setState(() {
          message = 'Cadastro realizado com sucesso!';
          isSuccess = true;
        });

        Future.delayed(const Duration(seconds: 2), () {
          Navigator.of(context).pushNamed('/login');
        });
      } else {
        final data = jsonDecode(response.body);
        setState(() {
          message = data['message'] ?? 'Erro no cadastro.';
          isSuccess = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        message = 'Erro ao conectar com o servidor.';
        isSuccess = false;
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
                onPressed: () => Navigator.of(context).pop(),
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
                    border: Border.all(color: primaryPurple, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        Text(
                          "Registrar",
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: primaryFontColor,
                          ),
                        ),
                        const SizedBox(height: 20),

                        _buildTextField(
                          label: "Nome:",
                          controller: nameController,
                          hint: "Digite seu nome",
                          isDark: isDark,
                          color: primaryFontColor,
                        ),
                        const SizedBox(height: 15),

                        _buildTextField(
                          label: "Email:",
                          controller: emailController,
                          hint: "Digite seu email",
                          keyboardType: TextInputType.emailAddress,
                          isDark: isDark,
                          color: primaryFontColor,
                        ),
                        const SizedBox(height: 15),

                        _buildTextField(
                          label: "Senha:",
                          controller: senhaController,
                          hint: "Digite sua senha",
                          isPassword: true,
                          isDark: isDark,
                          color: primaryPurple,
                        ),
                        const SizedBox(height: 15),

                        _buildTextField(
                          label: "Confirmar Senha:",
                          controller: confirmarSenhaController,
                          hint: "Confirme sua senha",
                          isPassword: true,
                          isDark: isDark,
                          color: primaryPurple,
                        ),
                        const SizedBox(height: 20),

                        if (message != null)
                          Text(
                            message!,
                            style: TextStyle(
                              color: isSuccess ? Colors.green : Colors.red,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        const SizedBox(height: 10),

                        isLoading
                            ? const CircularProgressIndicator()
                            : SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: register,
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
                                    'Registrar',
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
                              Navigator.of(context).pushNamed('/login'),
                          child: Text(
                            'Já tem conta? Faça login',
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

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    bool isPassword = false,
    required bool isDark,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(color: color, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          obscureText: isPassword,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 8,
              vertical: 10,
            ),
            filled: true,
            fillColor: isDark ? Colors.black12 : Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(5),
              borderSide: BorderSide(color: color, width: 2),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(5),
              borderSide: BorderSide(color: color, width: 2),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(5),
              borderSide: BorderSide(color: color.withOpacity(0.8), width: 2),
            ),
            hintText: hint,
            hintStyle: TextStyle(color: color.withOpacity(0.6)),
          ),
          style: TextStyle(color: color),
        ),
      ],
    );
  }
}
