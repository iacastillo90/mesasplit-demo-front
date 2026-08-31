package cl.labtab.api.audit;

import cl.labtab.api.common.enums.ExceptionEventTypeEnum;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    ExceptionEventTypeEnum eventType();
}
