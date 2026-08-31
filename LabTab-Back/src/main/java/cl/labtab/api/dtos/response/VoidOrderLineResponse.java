package cl.labtab.api.dtos.response;

import java.util.UUID;

public record VoidOrderLineResponse(
        boolean voided,
        UUID exceptionLogId
) {
}
