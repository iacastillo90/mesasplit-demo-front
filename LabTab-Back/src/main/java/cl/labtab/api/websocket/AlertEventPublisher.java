package cl.labtab.api.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AlertEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public AlertEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishFraud(UUID branchId, Object payload) {
        messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/alerts", new StompEvent("alert.fraud", payload));
    }
}
