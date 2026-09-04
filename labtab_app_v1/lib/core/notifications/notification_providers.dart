import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/core/notifications/notification_service.dart';

final notificationServiceProvider = Provider<NotificationService>((ref) {
  return LocalNotificationService();
});
