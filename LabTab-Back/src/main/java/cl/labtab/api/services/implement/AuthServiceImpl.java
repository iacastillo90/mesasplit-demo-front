package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.BranchRoleStatusEnum;
import cl.labtab.api.common.enums.CompanyRoleEnum;
import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.dtos.request.GuestSessionRequest;
import cl.labtab.api.dtos.request.LoginRequest;
import cl.labtab.api.dtos.request.LogoutRequest;
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
import cl.labtab.api.models.RevokedToken;
import cl.labtab.api.repositories.BranchRoleRepository;
import cl.labtab.api.repositories.CompanyRoleRepository;
import cl.labtab.api.repositories.DineGuestRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.DiningTableRepository;
import cl.labtab.api.repositories.PersonProfileRepository;
import cl.labtab.api.repositories.PersonRepository;
import cl.labtab.api.repositories.RevokedTokenRepository;
import cl.labtab.api.security.JwtService;
import cl.labtab.api.security.RateLimitService;
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
    private final RevokedTokenRepository revokedTokenRepository;
    private final RateLimitService rateLimitService;

    public AuthServiceImpl(PersonRepository personRepository,
                           PersonProfileRepository personProfileRepository,
                           CompanyRoleRepository companyRoleRepository,
                           BranchRoleRepository branchRoleRepository,
                           DiningTableRepository diningTableRepository,
                           DineSessionRepository dineSessionRepository,
                           DineGuestRepository dineGuestRepository,
                           JwtService jwtService,
                           PasswordEncoder passwordEncoder,
                           GuestMapper guestMapper,
                           RevokedTokenRepository revokedTokenRepository,
                           RateLimitService rateLimitService) {
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
        this.revokedTokenRepository = revokedTokenRepository;
        this.rateLimitService = rateLimitService;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Person person = personRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    rateLimitService.onFailure("login:" + request.email());
                    return new BusinessRuleException("INVALID_CREDENTIALS", "Credenciales inválidas");
                });

        if (!passwordEncoder.matches(request.password(), person.getPasswordHash())) {
            rateLimitService.onFailure("login:" + request.email());
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Credenciales inválidas");
        }

        rateLimitService.onSuccess("login:" + request.email());

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
                jwtService.getAccessTokenExpiration(),
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
        String token = request.refreshToken();

        if (!"refresh".equals(jwtService.extractType(token))) {
            throw new BusinessRuleException("INVALID_REFRESH", "Refresh token inválido");
        }
        if (jwtService.isTokenExpired(token)) {
            throw new BusinessRuleException("INVALID_REFRESH", "Refresh token inválido");
        }
        if (revokedTokenRepository.existsById(jwtService.extractJti(token))) {
            throw new BusinessRuleException("REVOKED_REFRESH", "Refresh token revocado");
        }

        UUID personId = UUID.fromString(jwtService.extractSubject(token));
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new BusinessRuleException("INVALID_REFRESH", "Refresh token inválido"));

        if (!person.isActive()) {
            throw new BusinessRuleException("ACCOUNT_INACTIVE", "Cuenta inactiva");
        }

        BranchRole branchRole = activeBranchRole(person.getId());
        String accessToken = jwtService.generateAccessToken(person, branchRole.getBranchId(), resolveRole(person.getId(), branchRole));
        String newRefresh = jwtService.generateRefreshToken(person);

        revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
        revokedTokenRepository.save(new RevokedToken(jwtService.extractJti(token), jwtService.getExpiration(token).toInstant()));

        return new RefreshTokenResponse(accessToken, jwtService.getAccessTokenExpiration(), newRefresh);
    }

    @Override
    public LogoutResponse logout(LogoutRequest request) {
        if (request != null && request.refreshToken() != null) {
            String token = request.refreshToken();
            if ("refresh".equals(jwtService.extractType(token)) && !jwtService.isTokenExpired(token)) {
                revokedTokenRepository.save(new RevokedToken(jwtService.extractJti(token), jwtService.getExpiration(token).toInstant()));
            }
        }
        return new LogoutResponse("Sesión cerrada.");
    }

    @Override
    public GuestSessionResponse guestSession(GuestSessionRequest request) {
        DiningTable table = diningTableRepository.findByQrToken(request.qrToken())
                .orElseThrow(() -> new ResourceNotFoundException("QR_TOKEN_INVALID", "Mesa no encontrada"));

        DineSession session = dineSessionRepository.findByTableIdAndStatus(table.getId(), DineSessionStatusEnum.OPEN)
                .orElseThrow(() -> new ConflictException("SESSION_NOT_OPEN", "La mesa no tiene una sesión activa", null));

        DineGuest guest = new DineGuest();
        long nextGuestNumber = dineGuestRepository.countByDineSessionId(session.getId()) + 1;
        guest.setDineSessionId(session.getId());
        guest.setDisplayName(request.displayName() != null ? request.displayName() : "Cliente " + nextGuestNumber);
        guest.setTempLabel("Cliente " + nextGuestNumber);
        guest.setJoinedAt(Instant.now());
        guest = dineGuestRepository.save(guest);

        String accessToken = jwtService.generateGuestToken(guest.getId(), session.getId(), table.getBranchId());

        return new GuestSessionResponse(
                accessToken,
                jwtService.getAccessTokenExpiration(),
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
