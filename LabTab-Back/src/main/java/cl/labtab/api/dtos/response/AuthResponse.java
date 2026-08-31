package cl.labtab.api.dtos.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        PersonAuthResponse person
) {
}
