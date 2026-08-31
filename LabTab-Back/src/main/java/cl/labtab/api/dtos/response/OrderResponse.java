package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.OrderStatusEnum;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        OrderStatusEnum status,
        BigDecimal subtotal,
        BigDecimal total,
        int itemCount,
        List<OrderLineResponse> lines,
        UUID kitchenTicketId
) {
}
