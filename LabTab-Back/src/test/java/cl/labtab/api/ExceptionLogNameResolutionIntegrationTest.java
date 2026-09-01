package cl.labtab.api;

import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.dtos.response.ExceptionLogResponse;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.ExceptionLog;
import cl.labtab.api.models.Person;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.ExceptionLogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ExceptionLogNameResolutionIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    ExceptionLogService exceptionLogService;

    @Test
    void authorizedByName_isResolvedFromAuthorizedBy() {
        Branch branch = createBranch("B");
        Person actor = createPerson("actor@test.cl");
        Person authorizer = createPerson("authorizer@test.cl");

        ExceptionLog log = new ExceptionLog();
        log.setBranchId(branch.getId());
        log.setEventType(ExceptionEventTypeEnum.MANUAL_DISCOUNT);
        log.setPersonId(actor.getId());
        log.setAuthorizedBy(authorizer.getId());
        exceptionLogRepository.save(log);

        BranchContextHolder.set(branch.getId());

        Page<ExceptionLogResponse> page = exceptionLogService.list(null, null, null, Pageable.unpaged());
        List<ExceptionLogResponse> content = page.getContent();

        ExceptionLogResponse response = content.stream()
                .filter(r -> r.id().equals(log.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(response.personName()).isEqualTo(actor.getEmail());
        assertThat(response.authorizedByName()).isEqualTo(authorizer.getEmail());
    }
}
