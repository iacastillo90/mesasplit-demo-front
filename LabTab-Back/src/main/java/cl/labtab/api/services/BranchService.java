package cl.labtab.api.services;

import cl.labtab.api.dtos.request.TableStatusRequest;
import cl.labtab.api.dtos.response.BranchConfigResponse;
import cl.labtab.api.dtos.response.DiningFloorResponse;
import cl.labtab.api.dtos.response.DiningTableResponse;

import java.util.List;
import java.util.UUID;

public interface BranchService {

    BranchConfigResponse getConfig();

    List<DiningFloorResponse> getFloors();

    List<DiningTableResponse> getTables();

    DiningTableResponse updateTableStatus(UUID tableId, TableStatusRequest request);
}
