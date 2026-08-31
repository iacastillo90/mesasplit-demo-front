package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.DishResponse;
import cl.labtab.api.models.Dish;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DishMapper {

    @Mapping(source = "available", target = "isAvailable")
    DishResponse toResponse(Dish dish);
}
