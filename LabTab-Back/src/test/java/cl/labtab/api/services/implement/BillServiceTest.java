package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.OrderLineStatusEnum;
import cl.labtab.api.dtos.request.CreateBillRequest;
import cl.labtab.api.mappers.BillLineMapper;
import cl.labtab.api.mappers.BillMapper;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.BillLine;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.Order;
import cl.labtab.api.models.OrderLine;
import cl.labtab.api.repositories.BillLineRepository;
import cl.labtab.api.repositories.BillRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.OrderLineRepository;
import cl.labtab.api.repositories.OrderRepository;
import cl.labtab.api.security.BranchContextHolder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @Mock
    DineSessionRepository dineSessionRepository;
    @Mock
    OrderRepository orderRepository;
    @Mock
    OrderLineRepository orderLineRepository;
    @Mock
    BillRepository billRepository;
    @Mock
    BillLineRepository billLineRepository;
    @Mock
    PinValidationService pinValidationService;
    @Mock
    BillMapper billMapper;
    @Mock
    BillLineMapper billLineMapper;
    @InjectMocks
    BillServiceImpl billService;

    @Test
    void createBill_buildsBillLinePerGuest() {
        UUID branchId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID guestId = UUID.randomUUID();
        BranchContextHolder.set(branchId);

        DineSession session = mock(DineSession.class);
        when(session.getId()).thenReturn(sessionId);
        when(dineSessionRepository.findByIdAndBranchId(sessionId, branchId)).thenReturn(Optional.of(session));

        Order order = mock(Order.class);
        when(order.getId()).thenReturn(orderId);
        when(orderRepository.findByDineSessionIdAndBranchId(sessionId, branchId)).thenReturn(List.of(order));

        OrderLine line = mock(OrderLine.class);
        when(line.getStatus()).thenReturn(OrderLineStatusEnum.QUEUED);
        when(line.getLineTotal()).thenReturn(new BigDecimal("100"));
        when(line.getDineGuestId()).thenReturn(guestId);
        when(orderLineRepository.findByOrderIdInAndBranchId(anyCollection(), eq(branchId))).thenReturn(List.of(line));

        when(billRepository.save(any(Bill.class))).thenAnswer(inv -> inv.getArgument(0));
        when(billLineRepository.save(any(BillLine.class))).thenAnswer(inv -> inv.getArgument(0));

        billService.createBill(new CreateBillRequest(sessionId, new BigDecimal("10")));

        ArgumentCaptor<BillLine> captor = ArgumentCaptor.forClass(BillLine.class);
        verify(billLineRepository).save(captor.capture());
        assertThat(captor.getValue().getDineGuestId()).isEqualTo(guestId);
    }
}
