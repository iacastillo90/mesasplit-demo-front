package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.DiningTableResponse;
import cl.labtab.api.models.DiningTable;
import org.mapstruct.Mapper;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface DiningTableMapper {

    DiningTableResponse toResponse(DiningTable table, UUID activeSessionId);
}
