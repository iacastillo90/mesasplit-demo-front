package cl.labtab.api.dtos.response;

import java.util.List;
import java.util.UUID;

public record DiningFloorResponse(
        UUID id,
        String name,
        int displayOrder,
        List<MapZoneResponse> zones,
        List<DiningTableResponse> tables
) {
}
