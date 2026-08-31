package cl.labtab.api.exception;

import java.time.Instant;

public record ApiError(String code, String message, String detail, Instant timestamp, Object data) {

    public static ApiError of(String code, String message) {
        return new ApiError(code, message, null, Instant.now(), null);
    }

    public static ApiError of(String code, String message, Object data) {
        return new ApiError(code, message, null, Instant.now(), data);
    }
}
