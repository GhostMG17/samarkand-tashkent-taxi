package com.uz.taxi.samarkand_tashkent.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import com.uz.taxi.samarkand_tashkent.domain.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Full User Journey - Integration Test")
class FullUserJourneyIntegrationTest {

    @Autowired private WebApplicationContext webApplicationContext;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired private UserRepository userRepository;

    private MockMvc mockMvc;

    @PostConstruct
    void setupMockMvc() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    @Transactional
    @DisplayName("🎯 Полный путь: регистрация → бронирование → оплата → отмена")
    void fullUserJourney() throws Exception {

        // ============================================================
        // ЭТАП 1: РЕГИСТРАЦИЯ
        // ============================================================

        String passengerPhone = "+998901111111";
        String passengerPassword = "passenger123";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "%s",
                                  "password": "%s",
                                  "firstName": "Ali",
                                  "lastName": "Karimov"
                                }
                                """.formatted(passengerPhone, passengerPassword)))
                .andExpect(status().isOk());

        String driverPhone = "+998902222222";
        String driverPassword = "driver123";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "%s",
                                  "password": "%s",
                                  "firstName": "Sardor",
                                  "lastName": "Driver"
                                }
                                """.formatted(driverPhone, driverPassword)))
                .andExpect(status().isOk());

        User driver = userRepository.findByPhone(driverPhone).orElseThrow();
        driver.setRole(User.Role.DRIVER);
        userRepository.save(driver);

        // ============================================================
        // ЭТАП 2: ЛОГИН
        // ============================================================

        String passengerToken = loginAndGetToken(passengerPhone, passengerPassword);
        String driverToken = loginAndGetToken(driverPhone, driverPassword);

        assertThat(passengerToken).isNotBlank();
        assertThat(driverToken).isNotBlank();

        // ============================================================
        // ЭТАП 3: ВОДИТЕЛЬ СОЗДАЁТ РЕЙС
        // ============================================================

        String departureTime = LocalDateTime.now().plusDays(2)
                .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        MvcResult createTripResult = mockMvc.perform(post("/api/trips")
                        .header("Authorization", "Bearer " + driverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "direction": "SAMARKAND_TO_TASHKENT",
                                  "departureTime": "%s",
                                  "totalSeats": 4,
                                  "price": 150000,
                                  "notes": "Comfortable Cobalt"
                                }
                                """.formatted(departureTime)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.direction").value("SAMARKAND_TO_TASHKENT"))
                .andExpect(jsonPath("$.availableSeats").value(4))
                .andReturn();

        Long tripId = objectMapper.readTree(createTripResult.getResponse().getContentAsString())
                .get("id").asLong();

        // ============================================================
        // ЭТАП 4: ПАССАЖИР ИЩЕТ РЕЙСЫ
        // ============================================================

        mockMvc.perform(get("/api/trips")
                        .param("direction", "SAMARKAND_TO_TASHKENT")
                        .param("minSeats", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(tripId))
                .andExpect(jsonPath("$.content[0].availableSeats").value(4));

        // ============================================================
        // ЭТАП 5: ПАССАЖИР БРОНИРУЕТ
        // ============================================================

        MvcResult bookingResult = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + passengerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tripId": %d,
                                  "seatsCount": 2
                                }
                                """.formatted(tripId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seatsCount").value(2))
                .andExpect(jsonPath("$.totalPrice").value(300000.00))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.paymentStatus").value("UNPAID"))
                .andReturn();

        Long bookingId = objectMapper.readTree(bookingResult.getResponse().getContentAsString())
                .get("id").asLong();

        // ============================================================
        // ЭТАП 6: МЕСТА УМЕНЬШИЛИСЬ
        // ============================================================

        mockMvc.perform(get("/api/trips/" + tripId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableSeats").value(2));

        // ============================================================
        // ЭТАП 7: ОПЛАТА
        // ============================================================

        mockMvc.perform(post("/api/payments/booking/" + bookingId + "/pay")
                        .header("Authorization", "Bearer " + passengerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAID"))
                .andExpect(jsonPath("$.paymentId").exists())
                .andExpect(jsonPath("$.amount").value(300000.00));

        // ============================================================
        // ЭТАП 8: МОИ БРОНИРОВАНИЯ
        // ============================================================

        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", "Bearer " + passengerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(bookingId))
                .andExpect(jsonPath("$.content[0].paymentStatus").value("PAID"));

        // ============================================================
        // ЭТАП 9: ПАССАЖИРЫ РЕЙСА (водитель)
        // ============================================================

        mockMvc.perform(get("/api/bookings/trip/" + tripId + "/passengers")
                        .header("Authorization", "Bearer " + driverToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].passengerName").value("Ali Karimov"))
                .andExpect(jsonPath("$[0].seatsCount").value(2));

        // ============================================================
        // ЭТАП 10: ОТМЕНА БРОНИРОВАНИЯ
        // ============================================================

        mockMvc.perform(patch("/api/bookings/" + bookingId + "/cancel")
                        .header("Authorization", "Bearer " + passengerToken))
                .andExpect(status().isNoContent());

        // ============================================================
        // ЭТАП 11: ВОЗВРАТ МЕСТ
        // ============================================================

        mockMvc.perform(get("/api/trips/" + tripId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableSeats").value(4));

        // ============================================================
        // ЭТАП 12: ЗАЩИТА — без токена бронировать нельзя
        // ============================================================

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tripId": %d,
                                  "seatsCount": 1
                                }
                                """.formatted(tripId)))
                .andExpect(status().isUnauthorized());

        // ============================================================
        // ЭТАП 13: ЗАЩИТА — пассажир не может создать рейс
        // ============================================================

        mockMvc.perform(post("/api/trips")
                        .header("Authorization", "Bearer " + passengerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "direction": "TASHKENT_TO_SAMARKAND",
                                  "departureTime": "%s",
                                  "totalSeats": 4,
                                  "price": 150000
                                }
                                """.formatted(departureTime)))
                .andExpect(status().isForbidden());
    }

    private String loginAndGetToken(String phone, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "%s",
                                  "password": "%s"
                                }
                                """.formatted(phone, password)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        if (json.has("accessToken")) {
            return json.get("accessToken").asText();
        }
        if (json.has("token")) {
            return json.get("token").asText();
        }
        throw new IllegalStateException("Token field not found in response: " + json);
    }
}