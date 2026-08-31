package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.OrderLineResponse;
import cl.labtab.api.dtos.response.OrderResponse;
import cl.labtab.api.models.Order;
import cl.labtab.api.models.OrderLine;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderResponse toResponse(Order order, List<OrderLineResponse> lines, UUID kitchenTicketId);
}
