package cl.labtab.api.security;

import cl.labtab.api.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UUID getCurrentPersonId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UUID id) {
            return id;
        }
        if (principal instanceof String s) {
            return UUID.fromString(s);
        }
        return null;
    }

    public static boolean isGuest() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_GUEST".equals(a.getAuthority()));
    }

    // Returns 404 (not 403) when a guest accesses another table's session to avoid
    // leaking the existence of that session (anti-enumeration).
    public static void enforceGuestSession(UUID resourceSessionId) {
        if (isGuest() && !resourceSessionId.equals(SessionContextHolder.get())) {
            throw new ResourceNotFoundException("Recurso no encontrado");
        }
    }
}
