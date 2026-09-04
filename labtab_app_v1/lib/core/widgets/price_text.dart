import 'package:flutter/material.dart';

class PriceText extends StatelessWidget {
  final int price;
  final TextStyle? style;

  const PriceText({super.key, required this.price, this.style});

  @override
  Widget build(BuildContext context) {
    return Text(
      '\$$price',
      style: style ??
          const TextStyle(
            fontWeight: FontWeight.w600,
            color: Color(0xFF10B981),
          ),
    );
  }
}
