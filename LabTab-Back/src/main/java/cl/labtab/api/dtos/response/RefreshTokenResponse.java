package cl.labtab.api.dtos.response;

public record RefreshTokenResponse(
        String accessToken,
        long expiresIn
) {
}
