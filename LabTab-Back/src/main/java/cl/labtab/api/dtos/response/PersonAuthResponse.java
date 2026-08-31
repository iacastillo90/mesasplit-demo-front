package cl.labtab.api.dtos.response;

import java.util.UUID;

public record PersonAuthResponse(
        UUID id,
        String email,
        String fullName,
        String role,
        UUID branchId,
        String avatarUrl
) {
}
