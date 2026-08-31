package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.dtos.request.TableStatusRequest;
import cl.labtab.api.dtos.response.BranchConfigResponse;
import cl.labtab.api.dtos.response.DiningFloorResponse;
import cl.labtab.api.dtos.response.DiningTableResponse;
import cl.labtab.api.dtos.response.MapZoneResponse;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.MapZone;
import cl.labtab.api.repositories.BranchRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.DiningFloorRepository;
import cl.labtab.api.repositories.DiningTableRepository;
import cl.labtab.api.repositories.MapZoneRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.BranchService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final DiningFloorRepository diningFloorRepository;
    private final MapZoneRepository mapZoneRepository;
    private final DiningTableRepository diningTableRepository;
    private final DineSessionRepository dineSessionRepository;

    public BranchServiceImpl(BranchRepository branchRepository,
                             DiningFloorRepository diningFloorRepository,
                             MapZoneRepository mapZoneRepository,
                             DiningTableRepository diningTableRepository,
                             DineSessionRepository dineSessionRepository) {
        this.branchRepository = branchRepository;
        this.diningFloorRepository = diningFloorRepository;
        this.mapZoneRepository = mapZoneRepository;
        this.diningTableRepository = diningTableRepository;
        this.dineSessionRepository = dineSessionRepository;
    }

    @Override
    public BranchConfigResponse getConfig() {
        Branch branch = branchRepository.findById(BranchContextHolder.get())
                .orElseThrow(() -> new ResourceNotFoundException("Branch no encontrada"));
        return new BranchConfigResponse(
                branch.getId(),
                branch.getName(),
                branch.getServiceChargePct(),
                branch.getTimezone(),
                branch.getOpeningHours());
    }

    @Override
    public List<DiningFloorResponse> getFloors() {
        UUID branchId = BranchContextHolder.get();
        return diningFloorRepository.findByBranchIdOrderByDisplayOrder(branchId).stream()
                .map(floor -> new DiningFloorResponse(
                        floor.getId(),
                        floor.getName(),
                        floor.getDisplayOrder(),
                        mapZoneRepository.findByFloorId(floor.getId()).stream().map(this::toMapZone).toList(),
                        diningTableRepository.findByFloorIdAndBranchId(floor.getId(), branchId).stream()
                                .map(t -> toTable(t, null)).toList()))
                .toList();
    }

    @Override
    public List<DiningTableResponse> getTables() {
        UUID branchId = BranchContextHolder.get();
        Map<UUID, UUID> sessionByTable = dineSessionRepository
                .findByBranchIdAndStatus(branchId, DineSessionStatusEnum.OPEN).stream()
                .collect(Collectors.toMap(DineSession::getTableId, DineSession::getId));
        return diningTableRepository.findByBranchId(branchId).stream()
                .map(t -> toTable(t, sessionByTable.get(t.getId())))
                .toList();
    }

    @Override
    public DiningTableResponse updateTableStatus(UUID tableId, TableStatusRequest request) {
        UUID branchId = BranchContextHolder.get();
        DiningTable table = diningTableRepository.findByIdAndBranchId(tableId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada"));
        table.setStatus(request.status());
        diningTableRepository.save(table);
        return toTable(table, null);
    }

    private MapZoneResponse toMapZone(MapZone zone) {
        return new MapZoneResponse(
                zone.getId(),
                zone.getName(),
                zone.getX(),
                zone.getY(),
                zone.getW(),
                zone.getH(),
                zone.getColor(),
                zone.getZIndex(),
                zone.isLabelOnly());
    }

    private DiningTableResponse toTable(DiningTable table, UUID activeSessionId) {
        return new DiningTableResponse(
                table.getId(),
                table.getName(),
                table.getZone(),
                table.getCapacity(),
                table.getStatus(),
                table.getQrToken(),
                table.getPositionX(),
                table.getPositionY(),
                table.getShape(),
                activeSessionId);
    }
}
