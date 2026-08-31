package cl.labtab.api;

import cl.labtab.api.controllers.MenuController;
import cl.labtab.api.dtos.response.DishResponse;
import cl.labtab.api.security.JwtService;
import cl.labtab.api.services.MenuService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MenuController.class)
@AutoConfigureMockMvc(addFilters = false)
class MenuControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    MenuService menuService;

    @MockBean
    JwtService jwtService;

    @Test
    void getSections_returnsOk() throws Exception {
        when(menuService.getSections()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/menu/sections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getDish_returnsOk() throws Exception {
        UUID dishId = UUID.randomUUID();
        when(menuService.getDish(any())).thenReturn(new DishResponse(
                dishId, "Lomo Vetado", "parrilla", new BigDecimal("8900"),
                null, true, List.of(), List.of(), 1));

        mockMvc.perform(get("/api/v1/menu/dishes/" + dishId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Lomo Vetado"));
    }
}
