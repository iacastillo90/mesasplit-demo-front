package cl.labtab.api.dtos.response;

import java.util.List;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        PersonAuthResponse person,
        List<BranchOptionResponse> availableBranches
) {
}
