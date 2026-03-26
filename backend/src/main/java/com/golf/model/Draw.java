package com.golf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "draws")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Draw {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "draw_date", nullable = false)
    private LocalDateTime drawDate;

    @Column(name = "draw_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DrawType drawType = DrawType.RANDOM;

    // Stored as JSON string in DB, exposed as List<Integer> to frontend
    @JsonIgnore
    @Column(name = "numbers_json", columnDefinition = "TEXT")
    private String numbersJson;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "jackpot_amount")
    @Builder.Default
    private BigDecimal jackpotAmount = BigDecimal.ZERO;

    @Column(name = "four_match_amount")
    @Builder.Default
    private BigDecimal fourMatchAmount = BigDecimal.ZERO;

    @Column(name = "three_match_amount")
    @Builder.Default
    private BigDecimal threeMatchAmount = BigDecimal.ZERO;

    @Column(name = "rollover_amount")
    @Builder.Default
    private BigDecimal rolloverAmount = BigDecimal.ZERO;

    @Column(name = "total_prize_pool")
    @Builder.Default
    private BigDecimal totalPrizePool = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Exposed to JSON as "numbers": [7, 14, 22, ...]
    public List<Integer> getNumbers() {
        if (numbersJson == null || numbersJson.isBlank()) return List.of();
        try {
            return new ObjectMapper().readValue(numbersJson, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    public void setNumbers(List<Integer> numbers) {
        try {
            this.numbersJson = new ObjectMapper().writeValueAsString(numbers);
        } catch (Exception e) {
            this.numbersJson = "[]";
        }
    }

    public enum DrawType {
        RANDOM, ALGORITHM
    }

    public enum Status {
        PENDING, SIMULATED, PUBLISHED
    }
}
