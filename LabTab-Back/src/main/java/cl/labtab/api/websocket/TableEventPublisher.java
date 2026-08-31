package cl.labtab.api.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TableEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public TableEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishStatusChanged(UUID branchId, Object payload) {
        messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/radar", new StompEvent("table.status_changed", payload));
    }
}
