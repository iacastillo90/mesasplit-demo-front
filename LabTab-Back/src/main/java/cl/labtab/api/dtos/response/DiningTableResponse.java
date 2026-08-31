package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.TableStatusEnum;

import java.util.UUID;

public record DiningTableResponse(
        UUID id,
        String name,
        String zone,
        int capacity,
        TableStatusEnum status,
        String qrToken,
        int positionX,
        int positionY,
        String shape,
        UUID activeSessionId
) {
}
