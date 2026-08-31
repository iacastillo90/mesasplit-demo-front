package cl.labtab.api.services;

import cl.labtab.api.dtos.request.CreateDishRequest;
import cl.labtab.api.dtos.request.CreateMenuSectionRequest;
import cl.labtab.api.dtos.request.DishAvailabilityRequest;
import cl.labtab.api.dtos.request.UpdateDishRequest;
import cl.labtab.api.dtos.request.UpdateMenuSectionRequest;
import cl.labtab.api.dtos.response.DishResponse;
import cl.labtab.api.dtos.response.MenuSectionResponse;

import java.util.List;
import java.util.UUID;

public interface MenuService {

    List<MenuSectionResponse> getSections();

    DishResponse getDish(UUID dishId);

    DishResponse updateDishAvailability(UUID dishId, DishAvailabilityRequest request);

    MenuSectionResponse createSection(CreateMenuSectionRequest request);

    MenuSectionResponse updateSection(UUID sectionId, UpdateMenuSectionRequest request);

    void deleteSection(UUID sectionId);

    DishResponse createDish(CreateDishRequest request);

    DishResponse updateDish(UUID dishId, UpdateDishRequest request);

    void deleteDish(UUID dishId);
}
