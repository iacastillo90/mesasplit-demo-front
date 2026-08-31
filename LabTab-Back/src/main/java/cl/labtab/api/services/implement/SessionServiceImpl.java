package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.dtos.request.AddGuestRequest;
import cl.labtab.api.dtos.request.CreateSessionRequest;
import cl.labtab.api.dtos.request.SessionStatusRequest;
import cl.labtab.api.dtos.response.GuestResponse;
import cl.labtab.api.dtos.response.SessionResponse;
import cl.labtab.api.exception.ConflictException;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.DineGuest;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.PersonProfile;
import cl.labtab.api.repositories.BillRepository;
import cl.labtab.api.repositories.DineGuestRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.DiningTableRepository;
import cl.labtab.api.repositories.PersonProfileRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.security.SecurityUtils;
import cl.labtab.api.services.SessionService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SessionServiceImpl implements SessionService {

    private final DineSessionRepository dineSessionRepository;
    private final DineGuestRepository dineGuestRepository;
    private final DiningTableRepository diningTableRepository;
    private final PersonProfileRepository personProfileRepository;
    private final BillRepository billRepository;

    public SessionServiceImpl(DineSessionRepository dineSessionRepository,
                              DineGuestRepository dineGuestRepository,
                              DiningTableRepository diningTableRepository,
                              PersonProfileRepository personProfileRepository,
                              BillRepository billRepository) {
        this.dineSessionRepository = dineSessionRepository;
        this.dineGuestRepository = dineGuestRepository;
        this.diningTableRepository = diningTableRepository;
        this.personProfileRepository = personProfileRepository;
        this.billRepository = billRepository;
    }

    @Override
    public SessionResponse createSession(CreateSessionRequest request) {
        UUID branchId = BranchContextHolder.get();
        DiningTable table = diningTableRepository.findByIdAndBranchId(request.tableId(), branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada"));

        dineSessionRepository.findByTableIdAndStatus(table.getId(), DineSessionStatusEnum.OPEN)
                .ifPresent(s -> {
                    throw new ConflictException("TABLE_ALREADY_OPEN", "La mesa ya tiene una sesión abierta", s.getId());
                });

        DineSession session = new DineSession();
        session.setTableId(table.getId());
        session.setBranchId(branchId);
        session.setStatus(DineSessionStatusEnum.OPEN);
        session.setGuestCount(request.guestCount());
        session.setOpenedBy(SecurityUtils.getCurrentPersonId());
        session.setStartedAt(Instant.now());
        session = dineSessionRepository.save(session);

        return toResponse(session, table, List.of());
    }

    @Override
    public SessionResponse getSession(UUID sessionId) {
        UUID branchId = BranchContextHolder.get();
        DineSession session = dineSessionRepository.findByIdAndBranchId(sessionId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada"));
        DiningTable table = diningTableRepository.findById(session.getTableId()).orElse(null);
        List<DineGuest> guests = dineGuestRepository.findByDineSessionId(session.getId());
        UUID activeBillId = billRepository.findByDineSessionIdAndBranchId(session.getId(), branchId)
                .map(Bill::getId).orElse(null);
        return toResponse(session, table, guests.stream().map(this::toGuest).toList(), activeBillId);
    }

    @Override
    public SessionResponse updateSessionStatus(UUID sessionId, SessionStatusRequest request) {
        UUID branchId = BranchContextHolder.get();
        DineSession session = dineSessionRepository.findByIdAndBranchId(sessionId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada"));

        if (request.status() == DineSessionStatusEnum.CLOSED) {
            billRepository.findByDineSessionIdAndBranchId(session.getId(), branchId)
                    .filter(b -> b.getBalanceDue() != null && b.getBalanceDue().compareTo(BigDecimal.ZERO) > 0)
                    .ifPresent(b -> {
                        throw new ConflictException("BILL_PENDING_BALANCE", "La sesión tiene una cuenta con saldo pendiente", b.getId());
                    });
        }

        session.setStatus(request.status());
        if (request.status() == DineSessionStatusEnum.CLOSED) {
            session.setEndedAt(Instant.now());
        }
        session = dineSessionRepository.save(session);

        DiningTable table = diningTableRepository.findById(session.getTableId()).orElse(null);
        List<DineGuest> guests = dineGuestRepository.findByDineSessionId(session.getId());
        return toResponse(session, table, guests.stream().map(this::toGuest).toList(), null);
    }

    @Override
    public GuestResponse addGuest(UUID sessionId, AddGuestRequest request) {
        UUID branchId = BranchContextHolder.get();
        DineSession session = dineSessionRepository.findByIdAndBranchId(sessionId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada"));

        DineGuest guest = new DineGuest();
        guest.setDineSessionId(session.getId());
        guest.setPersonId(request.personId());
        guest.setDisplayName(request.displayName());
        guest.setJoinedAt(Instant.now());
        guest = dineGuestRepository.save(guest);

        return toGuest(guest);
    }

    private GuestResponse toGuest(DineGuest guest) {
        List<String> allergies = List.of();
        if (guest.getPersonId() != null) {
            allergies = personProfileRepository.findByPersonId(guest.getPersonId())
                    .map(PersonProfile::getAllergies)
                    .orElse(List.of());
        }
        return new GuestResponse(guest.getId(), guest.getDisplayName(), guest.getTempLabel(), allergies);
    }

    private SessionResponse toResponse(DineSession session, DiningTable table, List<GuestResponse> guests) {
        return toResponse(session, table, guests, null);
    }

    private SessionResponse toResponse(DineSession session, DiningTable table, List<GuestResponse> guests, UUID activeBillId) {
        return new SessionResponse(
                session.getId(),
                session.getTableId(),
                table != null ? table.getName() : null,
                session.getStatus(),
                session.getGuestCount(),
                session.getOpenedBy(),
                session.getStartedAt(),
                session.getEndedAt(),
                guests,
                activeBillId);
    }
}
