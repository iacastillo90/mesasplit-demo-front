package cl.labtab.api.exception;

public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException() {
        super("Demasiados intentos. Intente más tarde.");
    }

    public RateLimitExceededException(String message) {
        super(message);
    }
}
