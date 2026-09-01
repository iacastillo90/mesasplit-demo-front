package cl.labtab.api.security;

import cl.labtab.api.exception.RateLimitExceededException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class RateLimitServiceTest {

    private static final int MAX_ATTEMPTS = 3;
    private static final long WINDOW_SECONDS = 900;

    @Test
    void onFailure_doesNotThrowWithinLimit() {
        RateLimitService rateLimit = new RateLimitService(MAX_ATTEMPTS, WINDOW_SECONDS);

        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            assertDoesNotThrow(() -> rateLimit.onFailure("login:test@example.com"));
        }
    }

    @Test
    void onFailure_throwsWhenExceedingLimit() {
        RateLimitService rateLimit = new RateLimitService(MAX_ATTEMPTS, WINDOW_SECONDS);

        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            rateLimit.onFailure("login:test@example.com");
        }

        assertThatThrownBy(() -> rateLimit.onFailure("login:test@example.com"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    void onSuccess_resetsCounter() {
        RateLimitService rateLimit = new RateLimitService(MAX_ATTEMPTS, WINDOW_SECONDS);

        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            rateLimit.onFailure("login:test@example.com");
        }

        rateLimit.onSuccess("login:test@example.com");

        assertDoesNotThrow(() -> rateLimit.onFailure("login:test@example.com"));
    }
}
