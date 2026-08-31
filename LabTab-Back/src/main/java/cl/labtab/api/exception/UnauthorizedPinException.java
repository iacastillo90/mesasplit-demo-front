package cl.labtab.api.exception;

public class UnauthorizedPinException extends BusinessRuleException {

    public UnauthorizedPinException(String message) {
        super("PIN_INVALID", message);
    }
}
