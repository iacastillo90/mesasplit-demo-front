package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.BranchConfigResponse;
import cl.labtab.api.models.Branch;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BranchMapper {

    BranchConfigResponse toResponse(Branch branch);
}
