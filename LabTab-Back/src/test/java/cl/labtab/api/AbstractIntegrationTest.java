package cl.labtab.api;

import cl.labtab.api.common.enums.BillStatusEnum;
import cl.labtab.api.common.enums.BranchRoleEnum;
import cl.labtab.api.common.enums.BranchRoleStatusEnum;
import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.BranchRole;
import cl.labtab.api.models.Company;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningFloor;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.Dish;
import cl.labtab.api.models.MenuSection;
import cl.labtab.api.models.Person;
import cl.labtab.api.repositories.BillLineRepository;
import cl.labtab.api.repositories.BillRepository;
import cl.labtab.api.repositories.BranchRepository;
import cl.labtab.api.repositories.BranchRoleRepository;
import cl.labtab.api.repositories.CompanyRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.DiningFloorRepository;
import cl.labtab.api.repositories.DiningTableRepository;
import cl.labtab.api.repositories.DishRepository;
import cl.labtab.api.repositories.ExceptionLogRepository;
import cl.labtab.api.repositories.MenuSectionRepository;
import cl.labtab.api.repositories.OrderLineRepository;
import cl.labtab.api.repositories.OrderRepository;
import cl.labtab.api.repositories.PaymentRepository;
import cl.labtab.api.repositories.PersonRepository;
import cl.labtab.api.security.BranchContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("labtab_test")
            .withUsername("test")
            .withPassword("test");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    protected JdbcTemplate jdbcTemplate;
    @Autowired
    protected PasswordEncoder passwordEncoder;
    @Autowired
    protected CompanyRepository companyRepository;
    @Autowired
    protected BranchRepository branchRepository;
    @Autowired
    protected PersonRepository personRepository;
    @Autowired
    protected BranchRoleRepository branchRoleRepository;
    @Autowired
    protected DiningFloorRepository diningFloorRepository;
    @Autowired
    protected DiningTableRepository diningTableRepository;
    @Autowired
    protected DineSessionRepository dineSessionRepository;
    @Autowired
    protected MenuSectionRepository menuSectionRepository;
    @Autowired
    protected DishRepository dishRepository;
    @Autowired
    protected OrderRepository orderRepository;
    @Autowired
    protected OrderLineRepository orderLineRepository;
    @Autowired
    protected BillRepository billRepository;
    @Autowired
    protected BillLineRepository billLineRepository;
    @Autowired
    protected PaymentRepository paymentRepository;
    @Autowired
    protected ExceptionLogRepository exceptionLogRepository;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.execute("""
                TRUNCATE TABLE exception_log, payment, bill_line, bill, kitchen_ticket, order_line, "order",
                    dish, menu_section, dine_guest, dine_session, dining_table, map_zone, dining_floor,
                    branch_role, company_role, person_profile, person, branch, company CASCADE
                """);
    }

    @AfterEach
    void clearContext() {
        BranchContextHolder.clear();
    }

    protected Branch createBranch(String name) {
        Company company = new Company();
        company.setName("Empresa " + name);
        company.setSlug("slug-" + UUID.randomUUID());
        companyRepository.save(company);

        Branch branch = new Branch();
        branch.setCompanyId(company.getId());
        branch.setName(name);
        return branchRepository.save(branch);
    }

    protected Person createPerson(String email) {
        Person person = new Person();
        person.setEmail(email);
        person.setPasswordHash(passwordEncoder.encode("password123"));
        return personRepository.save(person);
    }

    protected BranchRole createManager(Branch branch, Person person, String pin) {
        BranchRole role = new BranchRole();
        role.setBranchId(branch.getId());
        role.setPersonId(person.getId());
        role.setRole(BranchRoleEnum.MANAGER);
        role.setStatus(BranchRoleStatusEnum.ACTIVE);
        role.setPinCode(passwordEncoder.encode(pin));
        return branchRoleRepository.save(role);
    }

    protected DiningTable createTable(Branch branch, String qrToken) {
        DiningFloor floor = new DiningFloor();
        floor.setBranchId(branch.getId());
        diningFloorRepository.save(floor);

        DiningTable table = new DiningTable();
        table.setBranchId(branch.getId());
        table.setFloorId(floor.getId());
        table.setName("Mesa");
        table.setQrToken(qrToken);
        return diningTableRepository.save(table);
    }

    protected DineSession createSession(Branch branch, DiningTable table, Person opener) {
        DineSession session = new DineSession();
        session.setTableId(table.getId());
        session.setBranchId(branch.getId());
        session.setStatus(DineSessionStatusEnum.OPEN);
        session.setOpenedBy(opener.getId());
        session.setStartedAt(Instant.now());
        return dineSessionRepository.save(session);
    }

    protected Dish createDish(Branch branch, String name, String price) {
        MenuSection section = new MenuSection();
        section.setBranchId(branch.getId());
        section.setName("Sección");
        menuSectionRepository.save(section);

        Dish dish = new Dish();
        dish.setSectionId(section.getId());
        dish.setBranchId(branch.getId());
        dish.setName(name);
        dish.setPrice(new BigDecimal(price));
        return dishRepository.save(dish);
    }

    protected Bill createBill(Branch branch, DineSession session, String balance) {
        Bill bill = new Bill();
        bill.setDineSessionId(session.getId());
        bill.setBranchId(branch.getId());
        bill.setStatus(BillStatusEnum.OPEN);
        bill.setSubtotal(new BigDecimal(balance));
        bill.setTotalAmount(new BigDecimal(balance));
        bill.setBalanceDue(new BigDecimal(balance));
        return billRepository.save(bill);
    }
}
