package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.GuestResponse;
import cl.labtab.api.models.DineGuest;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DineGuestMapper {

    GuestResponse toResponse(DineGuest guest, List<String> allergies);
}
