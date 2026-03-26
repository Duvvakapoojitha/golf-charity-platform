package com.golf.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipationSummaryDto {
    private long totalDrawsEntered;
    private long totalWins;
    private BigDecimal totalWon;
    private long pendingPayments;
    private boolean hasActiveSubscription;
    private int currentScoreCount;
    private String nextDrawInfo; // "Monthly draw runs at end of month"
}
