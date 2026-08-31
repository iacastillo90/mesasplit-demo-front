package cl.labtab.api.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class OrderEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public OrderEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishItemAdded(UUID branchId, Object payload) {
        messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/kitchen", new StompEvent("order.item_added", payload));
    }

    public void publishCourseFire(UUID branchId, Object payload) {
        messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/kitchen", new StompEvent("course.fire", payload));
    }
}
