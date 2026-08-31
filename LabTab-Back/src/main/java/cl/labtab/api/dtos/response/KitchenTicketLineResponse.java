package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.CourseStatusEnum;
import cl.labtab.api.common.enums.OrderLineStatusEnum;

import java.util.List;
import java.util.UUID;

public record KitchenTicketLineResponse(
        UUID orderLineId,
        String name,
        int quantity,
        List<String> modifiers,
        List<String> allergyFlags,
        CourseStatusEnum courseStatus,
        OrderLineStatusEnum status
) {
}
