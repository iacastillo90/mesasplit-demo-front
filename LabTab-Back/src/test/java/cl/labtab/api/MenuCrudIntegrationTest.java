package cl.labtab.api;

import cl.labtab.api.dtos.request.CreateDishRequest;
import cl.labtab.api.dtos.request.CreateMenuSectionRequest;
import cl.labtab.api.dtos.request.DishAvailabilityRequest;
import cl.labtab.api.dtos.request.UpdateDishRequest;
import cl.labtab.api.dtos.request.UpdateMenuSectionRequest;
import cl.labtab.api.dtos.response.DishResponse;
import cl.labtab.api.dtos.response.MenuSectionResponse;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.models.Branch;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.MenuService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MenuCrudIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    MenuService menuService;

    @Test
    void createUpdateDeleteSection() {
        Branch branch = createBranch("A");
        BranchContextHolder.set(branch.getId());

        MenuSectionResponse created = menuService.createSection(
                new CreateMenuSectionRequest("Entradas", "para comenzar", 1));
        assertThat(created.name()).isEqualTo("Entradas");

        MenuSectionResponse updated = menuService.updateSection(created.id(),
                new UpdateMenuSectionRequest("Entradas Nuevas", "para comenzar", 1));
        assertThat(updated.name()).isEqualTo("Entradas Nuevas");

        menuService.deleteSection(created.id());
        assertThat(menuService.getSections()).isEmpty();
    }

    @Test
    void createUpdateDeleteDish() {
        Branch branch = createBranch("A");
        BranchContextHolder.set(branch.getId());
        MenuSectionResponse section = menuService.createSection(
                new CreateMenuSectionRequest("Fondos", null, 2));

        DishResponse created = menuService.createDish(
                new CreateDishRequest(section.id(), "Lomo", "parrilla", new BigDecimal("8900"), null, null, null, 1));
        assertThat(created.name()).isEqualTo("Lomo");

        DishResponse updated = menuService.updateDish(created.id(),
                new UpdateDishRequest("Lomo Vetado", "parrilla", new BigDecimal("9500"), null, null, null, null, 1));
        assertThat(updated.name()).isEqualTo("Lomo Vetado");

        menuService.deleteDish(created.id());
        assertThatThrownBy(() -> menuService.getDish(created.id()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateAvailability_lista86() {
        Branch branch = createBranch("A");
        BranchContextHolder.set(branch.getId());
        MenuSectionResponse section = menuService.createSection(
                new CreateMenuSectionRequest("Bebidas", null, 3));
        DishResponse dish = menuService.createDish(
                new CreateDishRequest(section.id(), "Coca", null, new BigDecimal("1500"), null, null, null, 1));

        DishResponse updated = menuService.updateDishAvailability(dish.id(),
                new DishAvailabilityRequest(false, 0));
        assertThat(updated.isAvailable()).isFalse();
    }
}
