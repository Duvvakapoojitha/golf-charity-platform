package com.golf.controller;

import com.golf.dto.ApiResponse;
import com.golf.dto.SubscriptionRequest;
import com.golf.model.Subscription;
import com.golf.model.User;
import com.golf.repository.UserRepository;
import com.golf.service.SubscriptionService;
import com.golf.service.UserService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;
    private final UserRepository userRepository;

    @Value("${stripe.webhook.secret:whsec_placeholder}")
    private String webhookSecret;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus(Principal principal) {
        User user = userService.getByEmail(principal.getName());
        Subscription sub = subscriptionService.getLatestSubscription(user);
        boolean active = subscriptionService.isSubscribed(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "active", active,
                "subscription", sub != null ? sub : Map.of()
        )));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<Map<String, String>>> checkout(Principal principal,
                                                                      @Valid @RequestBody SubscriptionRequest request) {
        User user = userService.getByEmail(principal.getName());
        String url = subscriptionService.createCheckoutSession(user, request);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    @PostMapping("/mock-activate")
    public ResponseEntity<ApiResponse<Subscription>> mockActivate(Principal principal,
                                                                    @RequestBody SubscriptionRequest request) {
        User user = userService.getByEmail(principal.getName());
        Subscription sub = subscriptionService.activateSubscription(user, request.getPlan(),
                "mock_" + System.currentTimeMillis(), "mock_cus_" + user.getId());
        return ResponseEntity.ok(ApiResponse.success("Subscription activated", sub));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(Principal principal) {
        User user = userService.getByEmail(principal.getName());
        subscriptionService.cancelSubscription(user);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled", null));
    }

    /**
     * Stripe webhook — auto-activates subscription after real payment
     * Stripe sends POST to this endpoint when checkout.session.completed
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        // Skip signature check if using placeholder secret (dev mode)
        if (webhookSecret.equals("whsec_placeholder") || sigHeader == null) {
            log.warn("Webhook received without signature verification (dev mode)");
            return ResponseEntity.ok("ok");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            try {
                Session session = (Session) event.getDataObjectDeserializer()
                        .getObject().orElseThrow();

                String userId = session.getMetadata().get("userId");
                String plan = session.getMetadata().get("plan");

                if (userId != null && plan != null) {
                    User user = userRepository.findById(UUID.fromString(userId))
                            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                    Subscription.Plan subPlan = Subscription.Plan.valueOf(plan);
                    subscriptionService.activateSubscription(
                            user, subPlan,
                            session.getSubscription(),
                            session.getCustomer()
                    );
                    log.info("Subscription activated via webhook for user: {}", user.getEmail());
                }
            } catch (Exception e) {
                log.error("Error processing webhook: {}", e.getMessage());
                return ResponseEntity.internalServerError().body("Processing error");
            }
        }

        return ResponseEntity.ok("ok");
    }
}
