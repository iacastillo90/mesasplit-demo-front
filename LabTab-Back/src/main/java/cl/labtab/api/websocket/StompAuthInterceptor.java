package cl.labtab.api.websocket;

import cl.labtab.api.security.JwtService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.UUID;

@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    private static final String BRANCH_ID_ATTR = "branchId";
    private static final String ROLE_ATTR = "role";

    private final JwtService jwtService;

    public StompAuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractToken(accessor.getFirstNativeHeader("Authorization"));
            try {
                UUID branchId = jwtService.extractBranchId(token);
                String role = jwtService.extractRole(token);
                if (accessor.getSessionAttributes() == null) {
                    accessor.setSessionAttributes(new HashMap<>());
                }
                accessor.getSessionAttributes().put(BRANCH_ID_ATTR, branchId);
                accessor.getSessionAttributes().put(ROLE_ATTR, role);
            } catch (Exception e) {
                throw new MessagingException("Token inválido en CONNECT");
            }
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            validateSubscription(accessor);
        }

        return message;
    }

    private void validateSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        UUID jwtBranchId = accessor.getSessionAttributes() != null
                ? (UUID) accessor.getSessionAttributes().get(BRANCH_ID_ATTR)
                : null;
        UUID topicBranchId = extractBranchIdFromDestination(destination);

        if (topicBranchId != null && !topicBranchId.equals(jwtBranchId)) {
            throw new MessagingException("Acceso denegado al topic: " + destination);
        }
    }

    private String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    private UUID extractBranchIdFromDestination(String destination) {
        if (destination == null) {
            return null;
        }
        String[] parts = destination.split("/");
        if (parts.length >= 4 && "branch".equals(parts[2])) {
            try {
                return UUID.fromString(parts[3]);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
        return null;
    }
}
