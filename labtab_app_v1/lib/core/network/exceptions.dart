sealed class AppException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;
  final String? detail;

  AppException(this.message, {this.statusCode, this.code, this.detail});

  @override
  String toString() => '$runtimeType: $message';
}

class NetworkException extends AppException {
  NetworkException(super.message, {super.statusCode, super.code});
}

class AuthException extends AppException {
  AuthException(super.message, {super.statusCode, super.code});
}

class ValidationException extends AppException {
  ValidationException(super.message, {super.statusCode, super.code});
}

class ConflictException extends AppException {
  ConflictException(super.message, {super.statusCode, super.code, super.detail});
}

class BusinessRuleException extends AppException {
  BusinessRuleException(super.message,
      {super.statusCode, super.code, super.detail});
}

class NotFoundException extends AppException {
  NotFoundException(super.message, {super.statusCode, super.code});
}

class ServerException extends AppException {
  ServerException(super.message, {super.statusCode, super.code});
}

class SessionNotOpenException extends AppException {
  SessionNotOpenException(super.message,
      {super.statusCode = 409, super.code = 'SESSION_NOT_OPEN'});
}
