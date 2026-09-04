import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class QrScanScreen extends StatefulWidget {
  const QrScanScreen({super.key});

  @override
  State<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends State<QrScanScreen> {
  bool _isProcessing = false;
  MobileScannerController? _cameraController;

  @override
  void initState() {
    super.initState();
    _cameraController = MobileScannerController();
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  void _onDetected(BarcodeCapture capture) {
    if (_isProcessing) return;

    final barcode = capture.barcodes.firstOrNull;
    if (barcode == null || barcode.rawValue == null) return;

    setState(() => _isProcessing = true);

    final raw = barcode.rawValue!;

    String qrToken = raw;
    String tableName = '';

    if (raw.contains('?')) {
      final uri = Uri.parse(raw);
      qrToken = uri.queryParameters['qrToken'] ?? uri.queryParameters['token'] ?? raw;
      tableName = uri.queryParameters['tableName'] ?? uri.queryParameters['table'] ?? '';
    }

    context.push(
      '/onboarding?qrToken=$qrToken&tableName=$tableName',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Escanear QR'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => _cameraController?.toggleTorch(),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: MobileScanner(
              controller: _cameraController,
              onDetect: _onDetected,
            ),
          ),
          Container(
            padding: const EdgeInsets.all(24),
            child: const Column(
              children: [
                Icon(Icons.qr_code_scanner, size: 48, color: Color(0xFF10B981)),
                SizedBox(height: 12),
                Text(
                  'Escanea el QR de tu mesa',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                ),
                SizedBox(height: 8),
                Text(
                  'El código está en la mesa o en el menú',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
