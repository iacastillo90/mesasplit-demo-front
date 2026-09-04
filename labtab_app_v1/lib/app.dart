import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/theme.dart';
import 'config/routes.dart';

class LabTabApp extends ConsumerWidget {
  const LabTabApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'LabTab',
      theme: LabTabTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
