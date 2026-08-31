package cl.labtab.api.common.enums;

import java.util.Arrays;

public enum VoidReasonEnum {
    CORTESIA("Cortesía"),
    CLIENTE_INSATISFECHO("Cliente insatisfecho"),
    ERROR_DE_CARGA("Error de carga"),
    DETERIORO_INSUMO("Deterioro insumo");

    private final String displayName;

    VoidReasonEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static boolean isValid(String reason) {
        return Arrays.stream(values()).anyMatch(r -> r.displayName.equals(reason));
    }
}
