package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.GuestAuthResponse;
import cl.labtab.api.models.DineGuest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface GuestMapper {

    @Mapping(source = "sessionId", target = "dineSessionId")
    GuestAuthResponse toAuthResponse(DineGuest guest, UUID sessionId, UUID tableId, String tableName);
}
