package cl.labtab.api.models;

import cl.labtab.api.common.enums.OrderLineStatusEnum;
import cl.labtab.api.exception.BusinessRuleException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderLineTest {

    @Test
    void transitionTo_rejectsTransitionOutOfCancelled() {
        OrderLine line = new OrderLine();
        line.cancel();

        assertThatThrownBy(() -> line.transitionTo(OrderLineStatusEnum.SERVED))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Una línea anulada no puede cambiar de estado");
    }

    @Test
    void transitionTo_allowsNormalTransition() {
        OrderLine line = new OrderLine();

        line.transitionTo(OrderLineStatusEnum.PREPARING);

        assertThat(line.getStatus()).isEqualTo(OrderLineStatusEnum.PREPARING);
    }
}
