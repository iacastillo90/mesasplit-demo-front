package cl.labtab.api.common;

import java.time.Instant;
import java.util.UUID;

public record ApiResponse<T>(T data, Meta meta) {

    public record Meta(Instant timestamp, String requestId) {
    }

    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data, new Meta(Instant.now(), UUID.randomUUID().toString()));
    }
}
