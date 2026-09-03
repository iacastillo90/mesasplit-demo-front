package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.BranchRoleEnum;
import cl.labtab.api.common.enums.BranchRoleStatusEnum;
import cl.labtab.api.exception.UnauthorizedPinException;
import cl.labtab.api.models.BranchRole;
import cl.labtab.api.repositories.BranchRoleRepository;
import cl.labtab.api.security.RateLimitService;
import cl.labtab.api.services.ExceptionLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PinValidationServiceTest {

    @Mock
    BranchRoleRepository branchRoleRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    ExceptionLogService exceptionLogService;
    @Mock
    RateLimitService rateLimitService;
    @InjectMocks
    PinValidationService pinValidationService;

    @Test
    void correctPin_doesNotThrow() {
        BranchRole manager = new BranchRole();
        manager.setPinCode("$2a$12$hash");
        when(branchRoleRepository.findByBranchIdAndRole(any(), eq(BranchRoleEnum.MANAGER)))
                .thenReturn(List.of(manager));
        when(passwordEncoder.matches("1234", "$2a$12$hash")).thenReturn(true);

        assertDoesNotThrow(() -> pinValidationService.validateManagerPin(UUID.randomUUID(), "1234"));
    }

    @Test
    void incorrectPin_throwsUnauthorizedAndLogs() {
        BranchRole manager = new BranchRole();
        manager.setPinCode("$2a$12$hash");
        when(branchRoleRepository.findByBranchIdAndRole(any(), eq(BranchRoleEnum.MANAGER)))
                .thenReturn(List.of(manager));
        when(passwordEncoder.matches("9999", "$2a$12$hash")).thenReturn(false);

        assertThatThrownBy(() -> pinValidationService.validateManagerPin(UUID.randomUUID(), "9999"))
                .isInstanceOf(UnauthorizedPinException.class);
        verify(exceptionLogService).logFailedPin(any());
    }

    @Test
    void acceptsMatchingPinWhenMultipleActiveManagersExist() {
        BranchRole managerA = new BranchRole();
        managerA.setStatus(BranchRoleStatusEnum.ACTIVE);
        managerA.setPinCode("$2a$12$hashA");
        BranchRole managerB = new BranchRole();
        managerB.setStatus(BranchRoleStatusEnum.ACTIVE);
        managerB.setPinCode("$2a$12$hashB");
        when(branchRoleRepository.findByBranchIdAndRole(any(), eq(BranchRoleEnum.MANAGER)))
                .thenReturn(List.of(managerA, managerB));
        when(passwordEncoder.matches("1234", "$2a$12$hashA")).thenReturn(false);
        when(passwordEncoder.matches("1234", "$2a$12$hashB")).thenReturn(true);

        assertDoesNotThrow(() -> pinValidationService.validateManagerPin(UUID.randomUUID(), "1234"));
    }

    @Test
    void ignoresInactiveManagerPin() {
        BranchRole inactive = new BranchRole();
        inactive.setStatus(BranchRoleStatusEnum.INACTIVE);
        inactive.setPinCode("$2a$12$hashInactive");
        when(branchRoleRepository.findByBranchIdAndRole(any(), eq(BranchRoleEnum.MANAGER)))
                .thenReturn(List.of(inactive));

        assertThatThrownBy(() -> pinValidationService.validateManagerPin(UUID.randomUUID(), "1234"))
                .isInstanceOf(UnauthorizedPinException.class);
    }
}
