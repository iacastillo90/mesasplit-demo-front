package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.ExceptionLogResponse;
import cl.labtab.api.models.ExceptionLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExceptionLogMapper {

    ExceptionLogResponse toResponse(ExceptionLog log, String personName, String authorizedByName, String orderLineName);
}
