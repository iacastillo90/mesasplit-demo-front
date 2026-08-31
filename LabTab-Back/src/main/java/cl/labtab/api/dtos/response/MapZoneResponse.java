package cl.labtab.api.dtos.response;

import java.util.UUID;

public record MapZoneResponse(
        UUID id,
        String name,
        int x,
        int y,
        int w,
        int h,
        String color,
        int zIndex,
        boolean isLabelOnly
) {
}
