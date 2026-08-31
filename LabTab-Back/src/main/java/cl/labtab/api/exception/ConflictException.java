package cl.labtab.api.exception;

public class ConflictException extends RuntimeException {

    private final String errorCode;
    private final Object data;

    public ConflictException(String errorCode, String message, Object data) {
        super(message);
        this.errorCode = errorCode;
        this.data = data;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object getData() {
        return data;
    }
}
