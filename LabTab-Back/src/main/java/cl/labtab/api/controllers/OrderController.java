package cl.labtab.api.controllers;

import cl.labtab.api.common.ApiResponse;
import cl.labtab.api.dtos.request.CreateOrderRequest;
import cl.labtab.api.dtos.request.FireCourseRequest;
import cl.labtab.api.dtos.request.OrderLineStatusRequest;
import cl.labtab.api.dtos.request.VoidOrderLineRequest;
import cl.labtab.api.dtos.response.FireCourseResponse;
import cl.labtab.api.dtos.response.OrderLineResponse;
import cl.labtab.api.dtos.response.OrderResponse;
import cl.labtab.api.dtos.response.VoidOrderLineResponse;
import cl.labtab.api.services.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF','GUEST')")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(orderService.createOrder(request)));
    }

    @GetMapping("/orders/{orderId}")
    public ApiResponse<OrderResponse> getOrder(@PathVariable UUID orderId) {
        return ApiResponse.of(orderService.getOrder(orderId));
    }

    @GetMapping("/sessions/{sessionId}/orders")
    public ApiResponse<List<OrderResponse>> getSessionOrders(@PathVariable UUID sessionId) {
        return ApiResponse.of(orderService.getSessionOrders(sessionId));
    }

    @PatchMapping("/order-lines/{lineId}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF','KITCHEN')")
    public ApiResponse<OrderLineResponse> updateLineStatus(@PathVariable UUID lineId, @Valid @RequestBody OrderLineStatusRequest request) {
        return ApiResponse.of(orderService.updateOrderLineStatus(lineId, request));
    }

    @DeleteMapping("/order-lines/{lineId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ApiResponse<VoidOrderLineResponse> voidLine(@PathVariable UUID lineId, @Valid @RequestBody VoidOrderLineRequest request) {
        return ApiResponse.of(orderService.voidOrderLine(lineId, request));
    }

    @PostMapping("/orders/{orderId}/fire-course")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ApiResponse<FireCourseResponse> fireCourse(@PathVariable UUID orderId, @Valid @RequestBody FireCourseRequest request) {
        return ApiResponse.of(orderService.fireCourse(orderId, request));
    }
}
