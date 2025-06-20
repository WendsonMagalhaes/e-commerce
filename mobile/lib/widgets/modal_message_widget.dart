import 'package:flutter/material.dart';

enum ModalType { success, warning, error }

class ModalMessage extends StatelessWidget {
  final String title;
  final String message;
  final ModalType type;
  final VoidCallback onClose;

  const ModalMessage({
    Key? key,
    required this.title,
    required this.message,
    required this.type,
    required this.onClose,
  }) : super(key: key);

  IconData get icon {
    switch (type) {
      case ModalType.success:
        return Icons.check_circle;
      case ModalType.warning:
        return Icons.warning_amber_rounded;
      case ModalType.error:
        return Icons.error;
    }
  }

  Color get iconColor {
    switch (type) {
      case ModalType.success:
        return Color(0xFF72B182);
      case ModalType.warning:
        return Color(0xFFD1B85D);
      case ModalType.error:
        return Color(0xFFD46A6A);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onClose,
      child: Scaffold(
        backgroundColor: Colors.black54,
        body: Center(
          child: GestureDetector(
            onTap: () {},
            child: Container(
              width: 320,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              decoration: BoxDecoration(
                color: Theme.of(context).dialogBackgroundColor,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 64, color: iconColor),
                  const SizedBox(height: 12),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: iconColor,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    message,
                    style: TextStyle(fontSize: 16, color: iconColor),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
