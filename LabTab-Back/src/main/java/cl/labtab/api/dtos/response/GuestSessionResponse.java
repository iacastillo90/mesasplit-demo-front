package cl.labtab.api.dtos.response;

public record GuestSessionResponse(
        String accessToken,
        long expiresIn,
        GuestAuthResponse guest
) {
}
