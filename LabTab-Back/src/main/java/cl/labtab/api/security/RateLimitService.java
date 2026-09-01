package cl.labtab.api.security;

import cl.labtab.api.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitService {

    private static final class Window {
        private final AtomicInteger count = new AtomicInteger();
        private final long windowStartMillis;

        Window(long windowStartMillis) {
            this.windowStartMillis = windowStartMillis;
        }
    }

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final int maxAttempts;
    private final long windowSeconds;

    public RateLimitService(
            @Value("${app.rate-limit.max-attempts:5}") int maxAttempts,
            @Value("${app.rate-limit.window-seconds:900}") long windowSeconds) {
        this.maxAttempts = maxAttempts;
        this.windowSeconds = windowSeconds;
    }

    public void onFailure(String key) {
        long now = System.currentTimeMillis();
        Window window = windows.compute(key, (k, existing) ->
                (existing == null || isExpired(existing, now)) ? new Window(now) : existing);
        int count = window.count.incrementAndGet();
        if (count > maxAttempts) {
            throw new RateLimitExceededException();
        }
    }

    public void onSuccess(String key) {
        windows.remove(key);
    }

    private boolean isExpired(Window window, long now) {
        return now - window.windowStartMillis > windowSeconds * 1000L;
    }
}
