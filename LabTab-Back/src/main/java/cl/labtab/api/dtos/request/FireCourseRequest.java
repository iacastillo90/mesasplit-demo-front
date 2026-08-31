package cl.labtab.api.dtos.request;

import cl.labtab.api.common.enums.CourseTypeEnum;
import jakarta.validation.constraints.NotNull;

public record FireCourseRequest(
        @NotNull CourseTypeEnum courseType
) {
}
