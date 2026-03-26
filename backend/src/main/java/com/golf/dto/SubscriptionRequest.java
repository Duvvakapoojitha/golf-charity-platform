package com.golf.dto;

import com.golf.model.Subscription;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscriptionRequest {
    @NotNull
    private Subscription.Plan plan;
    private String successUrl;
    private String cancelUrl;
}
