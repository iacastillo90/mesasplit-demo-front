package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.BranchRoleEnum;
import cl.labtab.api.common.enums.BranchRoleStatusEnum;
import cl.labtab.api.exception.UnauthorizedPinException;
import cl.labtab.api.models.BranchRole;
import cl.labtab.api.repositories.BranchRoleRepository;
import cl.labtab.api.security.RateLimitService;
import cl.labtab.api.services.ExceptionLogService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
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
        List<BranchRole> managers = branchRoleRepository.findByBranchIdAndRole(branchId, BranchRoleEnum.MANAGER);

        boolean matched = managers.stream()
                .filter(r -> r.getStatus() == BranchRoleStatusEnum.ACTIVE)
                .anyMatch(r -> passwordEncoder.matches(providedPin, r.getPinCode()));

        if (!matched) {
            rateLimitService.onFailure("pin:" + branchId);
            exceptionLogService.logFailedPin(branchId);
            throw new UnauthorizedPinException("PIN incorrecto");
        }

        rateLimitService.onSuccess("pin:" + branchId);
    }
}
