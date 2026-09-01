package cl.labtab.api;

import cl.labtab.api.dtos.request.LogoutRequest;
import cl.labtab.api.dtos.request.RefreshTokenRequest;
import cl.labtab.api.dtos.response.RefreshTokenResponse;
import cl.labtab.api.exception.BusinessRuleException;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.BranchRole;
import cl.labtab.api.models.Person;
import cl.labtab.api.security.JwtService;
import cl.labtab.api.services.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthRefreshLogoutIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    AuthService authService;

    @Autowired
    JwtService jwtService;

    private Person createManagerPerson() {
        Branch branch = createBranch("Sucursal");
        Person person = createPerson("manager-" + System.nanoTime() + "@example.com");
        createManager(branch, person, "1234");
        return person;
    }

    private BranchRole activeRole(Person person) {
        return branchRoleRepository.findByPersonId(person.getId()).getFirst();
    }

    @Test
    void refresh_rotatesTokenAndRevokesOldToken() {
        Person person = createManagerPerson();
        String refreshToken = jwtService.generateRefreshToken(person);

        RefreshTokenResponse response = authService.refresh(new RefreshTokenRequest(refreshToken));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotEqualTo(refreshToken);

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest(refreshToken)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("revocado");
    }

    @Test
    void refresh_rejectsAccessToken() {
        Person person = createManagerPerson();
        BranchRole role = activeRole(person);
        String accessToken = jwtService.generateAccessToken(person, role.getBranchId(), role.getRole().name());

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest(accessToken)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Refresh token inválido");
    }

    @Test
    void logout_revokesRefreshToken() {
        Person person = createManagerPerson();
        String refreshToken = jwtService.generateRefreshToken(person);

        authService.logout(new LogoutRequest(refreshToken));

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest(refreshToken)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("revocado");
    }
}
