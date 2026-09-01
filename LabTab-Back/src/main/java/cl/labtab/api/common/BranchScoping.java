package cl.labtab.api.common;

import cl.labtab.api.exception.ResourceNotFoundException;

import java.util.Optional;
import java.util.UUID;
import java.util.function.BiFunction;

public final class BranchScoping {

    private BranchScoping() {
    }

    public static <T> T find(BiFunction<UUID, UUID, Optional<T>> lookup, UUID id, UUID branchId, String notFoundMessage) {
        return lookup.apply(id, branchId)
                .orElseThrow(() -> new ResourceNotFoundException(notFoundMessage));
    }
}
