package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.BillLineResponse;
import cl.labtab.api.models.BillLine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BillLineMapper {

    @Mapping(source = "id", target = "billLineId")
    BillLineResponse toResponse(BillLine line);
}
