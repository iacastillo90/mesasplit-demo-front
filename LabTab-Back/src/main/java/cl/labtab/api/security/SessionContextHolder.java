package cl.labtab.api.security;

import java.util.UUID;

public final class SessionContextHolder {

    private static final ThreadLocal<UUID> SESSION_ID = new ThreadLocal<>();

    private SessionContextHolder() {
    }

    public static void set(UUID sessionId) {
        SESSION_ID.set(sessionId);
    }

    public static UUID get() {
        return SESSION_ID.get();
    }

    public static void clear() {
        SESSION_ID.remove();
    }
}
