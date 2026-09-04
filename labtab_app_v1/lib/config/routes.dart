import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:labtab_app_v1/features/auth/presentation/providers/auth_provider.dart';
import 'package:labtab_app_v1/features/auth/presentation/screens/splash_screen.dart';
import 'package:labtab_app_v1/features/auth/presentation/screens/qr_scan_screen.dart';
import 'package:labtab_app_v1/features/auth/presentation/screens/onboarding_screen.dart';
import 'package:labtab_app_v1/features/auth/presentation/screens/login_screen.dart';
import 'package:labtab_app_v1/features/menu/presentation/screens/menu_screen.dart';
import 'package:labtab_app_v1/features/menu/presentation/screens/dish_detail_screen.dart';
import 'package:labtab_app_v1/features/order/presentation/screens/order_screen.dart';
import 'package:labtab_app_v1/features/bill/presentation/screens/bill_screen.dart';
import 'package:labtab_app_v1/features/bill/presentation/screens/bill_split_screen.dart';
import 'package:labtab_app_v1/features/payment/presentation/screens/payment_screen.dart';
import 'package:labtab_app_v1/features/payment/presentation/screens/payment_success_screen.dart';
import 'package:labtab_app_v1/features/sos/presentation/screens/sos_screen.dart';
import 'package:labtab_app_v1/features/feedback/presentation/screens/feedback_screen.dart';
import 'package:labtab_app_v1/features/profile/presentation/screens/profile_screen.dart';
import 'package:labtab_app_v1/features/home/presentation/screens/home_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: false,
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/qr-scan',
        builder: (context, state) => const QrScanScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) {
          final qrToken = state.uri.queryParameters['qrToken'] ?? '';
          final tableName = state.uri.queryParameters['tableName'] ?? '';
          return OnboardingScreen(
            qrToken: qrToken,
            tableName: tableName,
          );
        },
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => HomeScreen(child: child),
        routes: [
          GoRoute(
            path: '/menu',
            builder: (context, state) => const MenuScreen(),
            routes: [
              GoRoute(
                path: ':dishId',
                builder: (context, state) {
                  final dishId = state.pathParameters['dishId']!;
                  return DishDetailScreen(dishId: dishId);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/orders',
            builder: (context, state) => const OrderScreen(),
          ),
          GoRoute(
            path: '/bill',
            builder: (context, state) => const BillScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/bill-split',
        builder: (context, state) => const BillSplitScreen(),
      ),
      GoRoute(
        path: '/payment',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return PaymentScreen(
            billId: extra?['billId'] ?? '',
            totalAmount: extra?['totalAmount'] ?? 0,
            guestId: extra?['guestId'],
          );
        },
      ),
      GoRoute(
        path: '/payment-success',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return PaymentSuccessScreen(
            amount: extra?['amount'] ?? 0,
            method: extra?['method'] ?? '',
            paymentId: extra?['paymentId'],
          );
        },
      ),
      GoRoute(
        path: '/sos',
        builder: (context, state) => const SosScreen(),
      ),
      GoRoute(
        path: '/feedback',
        builder: (context, state) => const FeedbackScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
    redirect: (context, state) {
      final isAuth = authState.status == AuthStatus.authenticated;
      final isSplash = state.matchedLocation == '/splash';
      final isQrScan = state.matchedLocation == '/qr-scan';
      final isLogin = state.matchedLocation == '/login';
      final isOnboarding = state.matchedLocation.startsWith('/onboarding');

      if (isSplash || isQrScan || isLogin || isOnboarding) {
        return null;
      }

      if (!isAuth) {
        return '/qr-scan';
      }

      return null;
    },
  );
});
