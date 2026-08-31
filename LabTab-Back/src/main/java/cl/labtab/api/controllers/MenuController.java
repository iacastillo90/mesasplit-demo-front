package cl.labtab.api.controllers;

import cl.labtab.api.common.ApiResponse;
import cl.labtab.api.dtos.request.CreateDishRequest;
import cl.labtab.api.dtos.request.CreateMenuSectionRequest;
import cl.labtab.api.dtos.request.DishAvailabilityRequest;
import cl.labtab.api.dtos.request.UpdateDishRequest;
import cl.labtab.api.dtos.request.UpdateMenuSectionRequest;
import cl.labtab.api.dtos.response.DishResponse;
import cl.labtab.api.dtos.response.MenuSectionResponse;
import cl.labtab.api.services.MenuService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Menú", description = "Secciones, platos y disponibilidad (Lista 86).")
@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/sections")
    public ApiResponse<List<MenuSectionResponse>> getSections() {
        return ApiResponse.of(menuService.getSections());
    }

    @GetMapping("/dishes/{dishId}")
    public ApiResponse<DishResponse> getDish(@PathVariable UUID dishId) {
        return ApiResponse.of(menuService.getDish(dishId));
    }

    @PatchMapping("/dishes/{dishId}/availability")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF','KITCHEN')")
    public ApiResponse<DishResponse> updateAvailability(@PathVariable UUID dishId, @Valid @RequestBody DishAvailabilityRequest request) {
        return ApiResponse.of(menuService.updateDishAvailability(dishId, request));
    }

    @PostMapping("/sections")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<MenuSectionResponse>> createSection(@Valid @RequestBody CreateMenuSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(menuService.createSection(request)));
    }

    @PatchMapping("/sections/{sectionId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    public ApiResponse<MenuSectionResponse> updateSection(@PathVariable UUID sectionId, @Valid @RequestBody UpdateMenuSectionRequest request) {
        return ApiResponse.of(menuService.updateSection(sectionId, request));
    }

    @DeleteMapping("/sections/{sectionId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSection(@PathVariable UUID sectionId) {
        menuService.deleteSection(sectionId);
    }

    @PostMapping("/dishes")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<DishResponse>> createDish(@Valid @RequestBody CreateDishRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(menuService.createDish(request)));
    }

    @PatchMapping("/dishes/{dishId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    public ApiResponse<DishResponse> updateDish(@PathVariable UUID dishId, @Valid @RequestBody UpdateDishRequest request) {
        return ApiResponse.of(menuService.updateDish(dishId, request));
    }

    @DeleteMapping("/dishes/{dishId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDish(@PathVariable UUID dishId) {
        menuService.deleteDish(dishId);
    }
}
