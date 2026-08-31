package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.DishResponse;
import cl.labtab.api.dtos.response.MenuSectionResponse;
import cl.labtab.api.models.Dish;
import cl.labtab.api.models.MenuSection;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MenuSectionMapper {

    MenuSectionResponse toResponse(MenuSection section, List<DishResponse> dishes);
}
