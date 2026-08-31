package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.BranchRoleStatusEnum;
import cl.labtab.api.common.enums.CompanyRoleEnum;
import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.dtos.request.GuestSessionRequest;
import cl.labtab.api.dtos.request.LoginRequest;
import cl.labtab.api.dtos.request.RefreshTokenRequest;
import cl.labtab.api.dtos.response.AuthResponse;
import cl.labtab.api.dtos.response.GuestAuthResponse;
import cl.labtab.api.dtos.response.GuestSessionResponse;
import cl.labtab.api.dtos.response.LogoutResponse;
import cl.labtab.api.dtos.response.PersonAuthResponse;
import cl.labtab.api.dtos.response.RefreshTokenResponse;
import cl.labtab.api.exception.BusinessRuleException;
import cl.labtab.api.exception.ConflictException;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.mappers.GuestMapper;
import cl.labtab.api.models.BranchRole;
import cl.labtab.api.models.CompanyRole;
import cl.labtab.api.models.DineGuest;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.Person;
import cl.labtab.api.models.PersonProfile;
import cl.labtab.api.repositories.BranchRoleRepository;
import cl.labtab.api.repositories.CompanyRoleRepository;
import cl.labtab.api.repositories.DineGuestRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.DiningTableRepository;
import cl.labtab.api.repositories.PersonProfileRepository;
import cl.labtab.api.repositories.PersonRepository;
import cl.labtab.api.security.JwtService;
import cl.labtab.api.services.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final PersonRepository personRepository;
    private final PersonProfileRepository personProfileRepository;
    private final CompanyRoleRepository companyRoleRepository;
    private final BranchRoleRepository branchRoleRepository;
    private final DiningTableRepository diningTableRepository;
    private final DineSessionRepository dineSessionRepository;
    private final DineGuestRepository dineGuestRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final GuestMapper guestMapper;

    public AuthServiceImpl(PersonRepository personRepository,
                           PersonProfileRepository personProfileRepository,
                           CompanyRoleRepository companyRoleRepository,
                           BranchRoleRepository branchRoleRepository,
                           DiningTableRepository diningTableRepository,
                           DineSessionRepository dineSessionRepository,
                           DineGuestRepository dineGuestRepository,
                           JwtService jwtService,
                           PasswordEncoder passwordEncoder,
                           GuestMapper guestMapper) {
        this.personRepository = personRepository;
        this.personProfileRepository = personProfileRepository;
        this.companyRoleRepository = companyRoleRepository;
        this.branchRoleRepository = branchRoleRepository;
        this.diningTableRepository = diningTableRepository;
        this.dineSessionRepository = dineSessionRepository;
        this.dineGuestRepository = dineGuestRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.guestMapper = guestMapper;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Person person = personRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessRuleException("INVALID_CREDENTIALS", "Credenciales inválidas"));

        if (!passwordEncoder.matches(request.password(), person.getPasswordHash())) {
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Credenciales inválidas");
        }

        if (!person.isActive()) {
            throw new BusinessRuleException("ACCOUNT_INACTIVE", "Cuenta inactiva");
        }

        BranchRole branchRole = activeBranchRole(person.getId());
        String role = resolveRole(person.getId(), branchRole);
        String accessToken = jwtService.generateAccessToken(person, branchRole.getBranchId(), role);
        String refreshToken = jwtService.generateRefreshToken(person);
        PersonProfile profile = personProfileRepository.findByPersonId(person.getId()).orElse(null);

        return new AuthResponse(
                accessToken,
                refreshToken,
                14400,
                new PersonAuthResponse(
                        person.getId(),
                        person.getEmail(),
                        profile != null ? profile.getFullName() : null,
                        role,
                        branchRole.getBranchId(),
                        profile != null ? profile.getAvatarUrl() : null));
    }

    @Override
    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        UUID personId = UUID.fromString(jwtService.extractSubject(request.refreshToken()));
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new BusinessRuleException("INVALID_REFRESH", "Refresh token inválido"));

        if (!person.isActive()) {
            throw new BusinessRuleException("ACCOUNT_INACTIVE", "Cuenta inactiva");
        }

        BranchRole branchRole = activeBranchRole(person.getId());
        String accessToken = jwtService.generateAccessToken(person, branchRole.getBranchId(), resolveRole(person.getId(), branchRole));
        return new RefreshTokenResponse(accessToken, 14400);
    }

    @Override
    public LogoutResponse logout() {
        return new LogoutResponse("Sesión cerrada.");
    }

    @Override
    public GuestSessionResponse guestSession(GuestSessionRequest request) {
        DiningTable table = diningTableRepository.findByQrToken(request.qrToken())
                .orElseThrow(() -> new ResourceNotFoundException("QR_TOKEN_INVALID", "Mesa no encontrada"));

        DineSession session = dineSessionRepository.findByTableIdAndStatus(table.getId(), DineSessionStatusEnum.OPEN)
                .orElseThrow(() -> new ConflictException("SESSION_NOT_OPEN", "La mesa no tiene una sesión activa", null));

        DineGuest guest = new DineGuest();
        guest.setDineSessionId(session.getId());
        guest.setDisplayName(request.displayName() != null ? request.displayName() : "Cliente " + (dineGuestRepository.countByDineSessionId(session.getId()) + 1));
        guest.setTempLabel("Cliente " + (dineGuestRepository.countByDineSessionId(session.getId()) + 1));
        guest.setJoinedAt(Instant.now());
        guest = dineGuestRepository.save(guest);

        String accessToken = jwtService.generateGuestToken(guest.getId(), session.getId(), table.getBranchId());

        return new GuestSessionResponse(
                accessToken,
                14400,
                guestMapper.toAuthResponse(guest, session.getId(), table.getId(), table.getName()));
    }

    private BranchRole activeBranchRole(UUID personId) {
        List<BranchRole> roles = branchRoleRepository.findByPersonId(personId);
        return roles.stream()
                .filter(r -> r.getStatus() == BranchRoleStatusEnum.ACTIVE)
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException("NO_BRANCH_ROLE", "El usuario no tiene un rol de sucursal activo"));
    }

    private String resolveRole(UUID personId, BranchRole branchRole) {
        boolean isCompanyAdmin = companyRoleRepository.findByPersonId(personId).stream()
                .map(CompanyRole::getRole)
                .anyMatch(CompanyRoleEnum.ADMIN::equals);
        return isCompanyAdmin ? "SUPERADMIN" : branchRole.getRole().name();
    }
}
