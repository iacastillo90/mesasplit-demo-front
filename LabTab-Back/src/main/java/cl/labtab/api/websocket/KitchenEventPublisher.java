package cl.labtab.api.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class KitchenEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public KitchenEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishItemReady(UUID branchId, Object payload) {
        messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/kitchen", new StompEvent("kds.item_ready", payload));
    }

    public void publishStock86(UUID branchId, Object payload) {
        messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/kitchen", new StompEvent("kds.stock_86", payload));
    }
}
