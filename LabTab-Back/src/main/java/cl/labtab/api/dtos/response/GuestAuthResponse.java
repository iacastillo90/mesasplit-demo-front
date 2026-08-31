package cl.labtab.api.dtos.response;

import java.util.UUID;

public record GuestAuthResponse(
        UUID id,
        String displayName,
        UUID dineSessionId,
        UUID tableId,
        String tableName
) {
}
