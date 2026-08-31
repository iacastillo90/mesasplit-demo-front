package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.BillResponse;
import cl.labtab.api.models.Bill;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BillMapper {

    BillResponse toResponse(Bill bill);
}
