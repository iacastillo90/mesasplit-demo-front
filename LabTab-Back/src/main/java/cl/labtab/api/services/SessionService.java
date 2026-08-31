package cl.labtab.api.services;

import cl.labtab.api.dtos.request.AddGuestRequest;
import cl.labtab.api.dtos.request.CreateSessionRequest;
import cl.labtab.api.dtos.request.SessionStatusRequest;
import cl.labtab.api.dtos.response.GuestResponse;
import cl.labtab.api.dtos.response.SessionResponse;

import java.util.UUID;

public interface SessionService {

    SessionResponse createSession(CreateSessionRequest request);

    SessionResponse getSession(UUID sessionId);

    SessionResponse updateSessionStatus(UUID sessionId, SessionStatusRequest request);

    GuestResponse addGuest(UUID sessionId, AddGuestRequest request);
}
