package cl.labtab.api;

import cl.labtab.api.websocket.StompAuthInterceptor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;

import java.util.HashMap;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StompAuthIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    StompAuthInterceptor stompAuthInterceptor;

    @Test
    void subscribeToOtherBranch_isDenied() {
        UUID myBranch = UUID.randomUUID();
        UUID otherBranch = UUID.randomUUID();

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/branch/" + otherBranch + "/kitchen");
        accessor.setSessionAttributes(new HashMap<>());
        accessor.getSessionAttributes().put("branchId", myBranch);

        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> stompAuthInterceptor.preSend(message, null))
                .isInstanceOf(MessagingException.class);
    }
}
