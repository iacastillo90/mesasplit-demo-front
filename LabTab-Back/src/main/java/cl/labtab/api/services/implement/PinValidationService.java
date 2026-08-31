package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.BranchRoleEnum;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.exception.UnauthorizedPinException;
import cl.labtab.api.models.BranchRole;
import cl.labtab.api.repositories.BranchRoleRepository;
import cl.labtab.api.services.ExceptionLogService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PinValidationService {

    private final BranchRoleRepository branchRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ExceptionLogService exceptionLogService;

    public PinValidationService(BranchRoleRepository branchRoleRepository,
                                PasswordEncoder passwordEncoder,
                                ExceptionLogService exceptionLogService) {
        this.branchRoleRepository = branchRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.exceptionLogService = exceptionLogService;
    }

    public void validateManagerPin(UUID branchId, String providedPin) {
        BranchRole managerRole = branchRoleRepository.findByBranchIdAndRole(branchId, BranchRoleEnum.MANAGER)
                .orElseThrow(() -> new ResourceNotFoundException("MANAGER no encontrado en esta sucursal"));

        if (!passwordEncoder.matches(providedPin, managerRole.getPinCode())) {
            exceptionLogService.logFailedPin(branchId);
            throw new UnauthorizedPinException("PIN incorrecto");
        }
    }
}
