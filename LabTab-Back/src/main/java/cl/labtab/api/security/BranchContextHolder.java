package cl.labtab.api.security;

import java.util.UUID;

public final class BranchContextHolder {

    private static final ThreadLocal<UUID> BRANCH_ID = new ThreadLocal<>();

    private BranchContextHolder() {
    }

    public static void set(UUID branchId) {
        BRANCH_ID.set(branchId);
    }

    public static UUID get() {
        return BRANCH_ID.get();
    }

    public static void clear() {
        BRANCH_ID.remove();
    }
}
