import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/app.dart';

void main() {
  testWidgets('LabTabApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: LabTabApp()),
    );
    expect(find.text('LabTab'), findsOneWidget);
  });
}
