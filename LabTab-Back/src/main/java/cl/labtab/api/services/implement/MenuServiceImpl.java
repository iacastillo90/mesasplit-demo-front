package cl.labtab.api.services.implement;

import cl.labtab.api.common.BranchScoping;
import cl.labtab.api.dtos.request.CreateDishRequest;
import cl.labtab.api.dtos.request.CreateMenuSectionRequest;
import cl.labtab.api.dtos.request.DishAvailabilityRequest;
import cl.labtab.api.dtos.request.UpdateDishRequest;
import cl.labtab.api.dtos.request.UpdateMenuSectionRequest;
import cl.labtab.api.dtos.response.DishResponse;
import cl.labtab.api.dtos.response.MenuSectionResponse;
import cl.labtab.api.mappers.DishMapper;
import cl.labtab.api.mappers.MenuSectionMapper;
import cl.labtab.api.models.Dish;
import cl.labtab.api.models.MenuSection;
import cl.labtab.api.repositories.DishRepository;
import cl.labtab.api.repositories.MenuSectionRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.MenuService;
import cl.labtab.api.websocket.KitchenEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MenuServiceImpl implements MenuService {

    private final MenuSectionRepository menuSectionRepository;
    private final DishRepository dishRepository;
    private final MenuSectionMapper menuSectionMapper;
    private final DishMapper dishMapper;
    private final KitchenEventPublisher kitchenEventPublisher;

    public MenuServiceImpl(MenuSectionRepository menuSectionRepository,
                           DishRepository dishRepository,
                           MenuSectionMapper menuSectionMapper,
                           DishMapper dishMapper,
                           KitchenEventPublisher kitchenEventPublisher) {
        this.menuSectionRepository = menuSectionRepository;
        this.dishRepository = dishRepository;
        this.menuSectionMapper = menuSectionMapper;
        this.dishMapper = dishMapper;
        this.kitchenEventPublisher = kitchenEventPublisher;
    }

    @Override
    public List<MenuSectionResponse> getSections() {
        UUID branchId = BranchContextHolder.get();
        List<MenuSection> sections = menuSectionRepository.findByBranchIdOrderByDisplayOrder(branchId);
        Map<UUID, List<Dish>> dishesBySection = dishRepository
                .findAllBySectionIdInAndBranchIdOrderByDisplayOrder(sections.stream().map(MenuSection::getId).toList(), branchId)
                .stream()
                .collect(Collectors.groupingBy(Dish::getSectionId));

        return sections.stream()
                .map(section -> menuSectionMapper.toResponse(section,
                        dishesBySection.getOrDefault(section.getId(), List.of()).stream()
                                .map(dishMapper::toResponse).toList()))
                .toList();
    }

    @Override
    public DishResponse getDish(UUID dishId) {
        Dish dish = BranchScoping.find(dishRepository::findByIdAndBranchId, dishId, BranchContextHolder.get(), "Plato no encontrado");
        return dishMapper.toResponse(dish);
    }

    @Override
    public DishResponse updateDishAvailability(UUID dishId, DishAvailabilityRequest request) {
        Dish dish = BranchScoping.find(dishRepository::findByIdAndBranchId, dishId, BranchContextHolder.get(), "Plato no encontrado");
        dish.setAvailable(request.isAvailable());
        dish = dishRepository.save(dish);
        kitchenEventPublisher.publishStock86(BranchContextHolder.get(), Map.of(
                "dishId", dish.getId(),
                "status", request.isAvailable() ? "available" : "out_of_stock"));
        return dishMapper.toResponse(dish);
    }

    @Override
    public MenuSectionResponse createSection(CreateMenuSectionRequest request) {
        MenuSection section = new MenuSection();
        section.setBranchId(BranchContextHolder.get());
        section.setName(request.name());
        section.setDescription(request.description());
        section.setDisplayOrder(request.displayOrder());
        section = menuSectionRepository.save(section);
        return menuSectionMapper.toResponse(section, List.of());
    }

    @Override
    public MenuSectionResponse updateSection(UUID sectionId, UpdateMenuSectionRequest request) {
        MenuSection section = BranchScoping.find(menuSectionRepository::findByIdAndBranchId, sectionId, BranchContextHolder.get(), "Sección no encontrada");
        section.setName(request.name());
        section.setDescription(request.description());
        section.setDisplayOrder(request.displayOrder());
        section = menuSectionRepository.save(section);
        return menuSectionMapper.toResponse(section, List.of());
    }

    @Override
    public void deleteSection(UUID sectionId) {
        MenuSection section = BranchScoping.find(menuSectionRepository::findByIdAndBranchId, sectionId, BranchContextHolder.get(), "Sección no encontrada");
        menuSectionRepository.delete(section);
    }

    @Override
    public DishResponse createDish(CreateDishRequest request) {
        UUID branchId = BranchContextHolder.get();
        BranchScoping.find(menuSectionRepository::findByIdAndBranchId, request.sectionId(), branchId, "Sección no encontrada");

        Dish dish = new Dish();
        dish.setSectionId(request.sectionId());
        dish.setBranchId(branchId);
        dish.setName(request.name());
        dish.setDescription(request.description());
        dish.setPrice(request.price());
        dish.setImageUrl(request.imageUrl());
        dish.setTags(request.tags());
        dish.setAllergens(request.allergens());
        dish.setDisplayOrder(request.displayOrder());
        dish = dishRepository.save(dish);
        return dishMapper.toResponse(dish);
    }

    @Override
    public DishResponse updateDish(UUID dishId, UpdateDishRequest request) {
        Dish dish = BranchScoping.find(dishRepository::findByIdAndBranchId, dishId, BranchContextHolder.get(), "Plato no encontrado");
        dish.setName(request.name());
        dish.setDescription(request.description());
        if (request.price() != null) {
            dish.setPrice(request.price());
        }
        dish.setImageUrl(request.imageUrl());
        if (request.isAvailable() != null) {
            dish.setAvailable(request.isAvailable());
        }
        dish.setTags(request.tags());
        dish.setAllergens(request.allergens());
        dish.setDisplayOrder(request.displayOrder());
        dish = dishRepository.save(dish);
        return dishMapper.toResponse(dish);
    }

    @Override
    public void deleteDish(UUID dishId) {
        Dish dish = BranchScoping.find(dishRepository::findByIdAndBranchId, dishId, BranchContextHolder.get(), "Plato no encontrado");
        dishRepository.delete(dish);
    }
}
