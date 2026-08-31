package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.OrderLineStatusEnum;

import java.util.UUID;

public record OrderLineResponse(
        UUID id,
        String name,
        int quantity,
        OrderLineStatusEnum status
) {
}
