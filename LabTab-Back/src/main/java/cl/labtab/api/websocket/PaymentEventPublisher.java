package cl.labtab.api.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PaymentEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public PaymentEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishQrReceived(UUID branchId, Object payload) {
        messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/pos", new StompEvent("payment.qr_received", payload));
    }
}
