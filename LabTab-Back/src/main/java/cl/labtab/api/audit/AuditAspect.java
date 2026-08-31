package cl.labtab.api.audit;

import cl.labtab.api.services.ExceptionLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    private final ExceptionLogService exceptionLogService;

    public AuditAspect(ExceptionLogService exceptionLogService) {
        this.exceptionLogService = exceptionLogService;
    }

    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void logSuccessfulAuditableOperation(JoinPoint joinPoint, Auditable auditable, Object result) {
        exceptionLogService.createLog(auditable.eventType());
    }
}
