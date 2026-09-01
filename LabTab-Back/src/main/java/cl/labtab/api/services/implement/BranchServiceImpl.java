package cl.labtab.api.services.implement;

import cl.labtab.api.common.BranchScoping;
import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.dtos.request.TableStatusRequest;
import cl.labtab.api.dtos.response.BranchConfigResponse;
import cl.labtab.api.dtos.response.DiningFloorResponse;
import cl.labtab.api.dtos.response.DiningTableResponse;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.mappers.BranchMapper;
import cl.labtab.api.mappers.DiningTableMapper;
import cl.labtab.api.mappers.MapZoneMapper;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningFloor;
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
    private final BranchMapper branchMapper;
    private final MapZoneMapper mapZoneMapper;
    private final DiningTableMapper diningTableMapper;

    public BranchServiceImpl(BranchRepository branchRepository,
                             DiningFloorRepository diningFloorRepository,
                             MapZoneRepository mapZoneRepository,
                             DiningTableRepository diningTableRepository,
                             DineSessionRepository dineSessionRepository,
                             BranchMapper branchMapper,
                             MapZoneMapper mapZoneMapper,
                             DiningTableMapper diningTableMapper) {
        this.branchRepository = branchRepository;
        this.diningFloorRepository = diningFloorRepository;
        this.mapZoneRepository = mapZoneRepository;
        this.diningTableRepository = diningTableRepository;
        this.dineSessionRepository = dineSessionRepository;
        this.branchMapper = branchMapper;
        this.mapZoneMapper = mapZoneMapper;
        this.diningTableMapper = diningTableMapper;
    }

    @Override
    public BranchConfigResponse getConfig() {
        Branch branch = branchRepository.findById(BranchContextHolder.get())
                .orElseThrow(() -> new ResourceNotFoundException("Branch no encontrada"));
        return branchMapper.toResponse(branch);
    }

    @Override
    public List<DiningFloorResponse> getFloors() {
        UUID branchId = BranchContextHolder.get();
        List<DiningFloor> floors = diningFloorRepository.findByBranchIdOrderByDisplayOrder(branchId);
        List<UUID> floorIds = floors.stream().map(DiningFloor::getId).toList();

        Map<UUID, List<MapZone>> zonesByFloor = mapZoneRepository.findAllByFloorIdIn(floorIds).stream()
                .collect(Collectors.groupingBy(MapZone::getFloorId));
        Map<UUID, List<DiningTable>> tablesByFloor = diningTableRepository.findAllByFloorIdInAndBranchId(floorIds, branchId).stream()
                .collect(Collectors.groupingBy(DiningTable::getFloorId));

        return floors.stream()
                .map(floor -> new DiningFloorResponse(
                        floor.getId(),
                        floor.getName(),
                        floor.getDisplayOrder(),
                        zonesByFloor.getOrDefault(floor.getId(), List.of()).stream().map(mapZoneMapper::toResponse).toList(),
                        tablesByFloor.getOrDefault(floor.getId(), List.of()).stream()
                                .map(t -> diningTableMapper.toResponse(t, null)).toList()))
                .toList();
    }

    @Override
    public List<DiningTableResponse> getTables() {
        UUID branchId = BranchContextHolder.get();
        Map<UUID, UUID> sessionByTable = dineSessionRepository
                .findByBranchIdAndStatus(branchId, DineSessionStatusEnum.OPEN).stream()
                .collect(Collectors.toMap(DineSession::getTableId, DineSession::getId, (a, b) -> a));
        return diningTableRepository.findByBranchId(branchId).stream()
                .map(t -> diningTableMapper.toResponse(t, sessionByTable.get(t.getId())))
                .toList();
    }

    @Override
    public DiningTableResponse updateTableStatus(UUID tableId, TableStatusRequest request) {
        UUID branchId = BranchContextHolder.get();
        DiningTable table = BranchScoping.find(diningTableRepository::findByIdAndBranchId, tableId, branchId, "Mesa no encontrada");
        table.setStatus(request.status());
        diningTableRepository.save(table);
        return diningTableMapper.toResponse(table, null);
    }
}
