package cl.labtab.api.services;

import cl.labtab.api.dtos.request.CreateOrderRequest;
import cl.labtab.api.dtos.request.FireCourseRequest;
import cl.labtab.api.dtos.request.OrderLineStatusRequest;
import cl.labtab.api.dtos.request.VoidOrderLineRequest;
import cl.labtab.api.dtos.response.FireCourseResponse;
import cl.labtab.api.dtos.response.OrderLineResponse;
import cl.labtab.api.dtos.response.OrderResponse;
import cl.labtab.api.dtos.response.VoidOrderLineResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrder(UUID orderId);

    List<OrderResponse> getSessionOrders(UUID sessionId);

    OrderLineResponse updateOrderLineStatus(UUID orderLineId, OrderLineStatusRequest request);

    VoidOrderLineResponse voidOrderLine(UUID orderLineId, VoidOrderLineRequest request);

    FireCourseResponse fireCourse(UUID orderId, FireCourseRequest request);
}
