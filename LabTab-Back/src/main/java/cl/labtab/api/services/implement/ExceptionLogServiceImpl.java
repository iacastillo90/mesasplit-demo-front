package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.dtos.response.ExceptionLogResponse;
import cl.labtab.api.mappers.ExceptionLogMapper;
import cl.labtab.api.models.ExceptionLog;
import cl.labtab.api.models.Person;
import cl.labtab.api.repositories.ExceptionLogRepository;
import cl.labtab.api.repositories.PersonRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.ExceptionLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExceptionLogServiceImpl implements ExceptionLogService {

    private final ExceptionLogRepository exceptionLogRepository;
    private final PersonRepository personRepository;
    private final ExceptionLogMapper exceptionLogMapper;

    public ExceptionLogServiceImpl(ExceptionLogRepository exceptionLogRepository,
                                   PersonRepository personRepository,
                                   ExceptionLogMapper exceptionLogMapper) {
        this.exceptionLogRepository = exceptionLogRepository;
        this.personRepository = personRepository;
        this.exceptionLogMapper = exceptionLogMapper;
    }

    @Override
    public Page<ExceptionLogResponse> list(Instant from, Instant to, ExceptionEventTypeEnum eventType, Pageable pageable) {
        UUID branchId = BranchContextHolder.get();

        Page<ExceptionLog> page;
        if (eventType != null) {
            page = exceptionLogRepository.findByBranchIdAndEventType(branchId, eventType, pageable);
        } else if (from != null && to != null) {
            page = exceptionLogRepository.findByBranchIdAndCreatedAtBetween(branchId, from, to, pageable);
        } else {
            page = exceptionLogRepository.findByBranchId(branchId, pageable);
        }

        Map<UUID, String> names = personRepository.findAllById(
                        page.getContent().stream().map(ExceptionLog::getPersonId).filter(java.util.Objects::nonNull).toList())
                .stream().collect(Collectors.toMap(Person::getId, Person::getEmail));

        return page.map(log -> exceptionLogMapper.toResponse(
                log,
                names.get(log.getPersonId()),
                names.get(log.getAuthorizedBy()),
                null));
    }
}
