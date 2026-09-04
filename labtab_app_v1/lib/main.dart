import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/app.dart';
import 'package:labtab_app_v1/core/notifications/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalNotificationService().initialize();

  runApp(
    const ProviderScope(
      child: LabTabApp(),
    ),
  );
}
