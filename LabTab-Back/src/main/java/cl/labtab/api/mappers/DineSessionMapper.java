package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.GuestResponse;
import cl.labtab.api.dtos.response.SessionResponse;
import cl.labtab.api.models.DineGuest;
import cl.labtab.api.models.DineSession;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface DineSessionMapper {

    SessionResponse toResponse(DineSession session, String tableName, List<GuestResponse> guests, UUID activeBillId);
}
