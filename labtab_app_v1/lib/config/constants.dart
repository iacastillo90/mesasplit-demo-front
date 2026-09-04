class ApiConstants {
  static const connectTimeout = Duration(seconds: 10);
  static const receiveTimeout = Duration(seconds: 15);
  static const refreshBuffer = Duration(seconds: 60);
}

class StorageKeys {
  static const accessToken = 'labtab_access_token';
  static const refreshToken = 'labtab_refresh_token';
  static const guestId = 'labtab_guest_id';
  static const dineSessionId = 'labtab_dine_session_id';
  static const tableId = 'labtab_table_id';
  static const tableName = 'labtab_table_name';
  static const displayName = 'labtab_display_name';
}

class PollingConstants {
  static const orderPollInterval = Duration(seconds: 5);
}
