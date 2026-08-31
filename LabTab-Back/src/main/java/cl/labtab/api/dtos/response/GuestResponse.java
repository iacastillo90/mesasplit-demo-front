package cl.labtab.api.dtos.response;

import java.util.List;
import java.util.UUID;

public record GuestResponse(
        UUID id,
        String displayName,
        String tempLabel,
        List<String> allergies
) {
}
