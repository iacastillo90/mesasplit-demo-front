package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.OrderLineResponse;
import cl.labtab.api.models.OrderLine;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderLineMapper {

    OrderLineResponse toResponse(OrderLine line);
}
