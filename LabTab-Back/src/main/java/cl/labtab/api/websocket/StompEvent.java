package cl.labtab.api.websocket;

public record StompEvent(String event, Object payload) {
}
