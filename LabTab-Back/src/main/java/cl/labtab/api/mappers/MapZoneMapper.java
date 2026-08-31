package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.MapZoneResponse;
import cl.labtab.api.models.MapZone;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MapZoneMapper {

    @Mapping(source = "ZIndex", target = "zIndex")
    @Mapping(source = "labelOnly", target = "isLabelOnly")
    MapZoneResponse toResponse(MapZone zone);
}
