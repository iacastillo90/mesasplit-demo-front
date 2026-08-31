package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.KitchenTicketLineResponse;
import cl.labtab.api.dtos.response.KitchenTicketResponse;
import cl.labtab.api.models.KitchenTicket;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface KitchenTicketMapper {

    KitchenTicketResponse toResponse(KitchenTicket ticket, List<KitchenTicketLineResponse> lines, long elapsedSeconds);
}
