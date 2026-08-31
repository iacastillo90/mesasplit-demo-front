package cl.labtab.api.mappers;

import cl.labtab.api.dtos.response.BillResponse;
import cl.labtab.api.dtos.response.PaymentResponse;
import cl.labtab.api.models.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(source = "payment.id", target = "id")
    @Mapping(source = "payment.status", target = "status")
    @Mapping(source = "payment.totalAmount", target = "totalAmount")
    PaymentResponse toResponse(Payment payment, BillResponse bill);
}
