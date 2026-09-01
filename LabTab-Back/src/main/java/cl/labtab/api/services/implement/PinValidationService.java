package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.BranchRoleEnum;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.exception.UnauthorizedPinException;
import cl.labtab.api.models.BranchRole;
import cl.labtab.api.repositories.BranchRoleRepository;
import cl.labtab.api.security.RateLimitService;
import cl.labtab.api.services.ExceptionLogService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PinValidationService {

    private final BranchRoleRepository branchRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ExceptionLogService exceptionLogService;
    private final RateLimitService rateLimitService;

    public PinValidationService(BranchRoleRepository branchRoleRepository,
                                PasswordEncoder passwordEncoder,
                                ExceptionLogService exceptionLogService,
                                RateLimitService rateLimitService) {
        this.branchRoleRepository = branchRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.exceptionLogService = exceptionLogService;
        this.rateLimitService = rateLimitService;
    }

    public void validateManagerPin(UUID branchId, String providedPin) {
        BranchRole managerRole = branchRoleRepository.findByBranchIdAndRole(branchId, BranchRoleEnum.MANAGER)
                .orElseThrow(() -> new ResourceNotFoundException("MANAGER no encontrado en esta sucursal"));

        if (!passwordEncoder.matches(providedPin, managerRole.getPinCode())) {
            rateLimitService.onFailure("pin:" + branchId);
            exceptionLogService.logFailedPin(branchId);
            throw new UnauthorizedPinException("PIN incorrecto");
        }

        rateLimitService.onSuccess("pin:" + branchId);
    }
}
