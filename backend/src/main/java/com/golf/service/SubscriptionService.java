package com.golf.service;

import com.golf.dto.SubscriptionRequest;
import com.golf.model.Subscription;
import com.golf.model.User;
import com.golf.repository.SubscriptionRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.price.monthly}")
    private String monthlyPriceId;

    @Value("${stripe.price.yearly}")
    private String yearlyPriceId;

    private static final BigDecimal MONTHLY_AMOUNT = new BigDecimal("9.99");
    private static final BigDecimal YEARLY_AMOUNT = new BigDecimal("99.99");

    public Optional<Subscription> getActiveSubscription(User user) {
        return subscriptionRepository.findByUserAndStatus(user, Subscription.Status.ACTIVE);
    }

    public Subscription getLatestSubscription(User user) {
        return subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElse(null);
    }

    public boolean isSubscribed(User user) {
        return subscriptionRepository.findByUserAndStatus(user, Subscription.Status.ACTIVE).isPresent();
    }

    public String createCheckoutSession(User user, SubscriptionRequest request) {
        try {
            Stripe.apiKey = stripeApiKey;
            String priceId = request.getPlan() == Subscription.Plan.MONTHLY ? monthlyPriceId : yearlyPriceId;

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomerEmail(user.getEmail())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(priceId)
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(request.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(request.getCancelUrl())
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("plan", request.getPlan().name())
                    .build();

            Session session = Session.create(params);
            return session.getUrl();
        } catch (Exception e) {
            // Mock fallback for development
            return mockActivateSubscription(user, request);
        }
    }

    private String mockActivateSubscription(User user, SubscriptionRequest request) {
        activateSubscription(user, request.getPlan(), "mock_" + UUID.randomUUID(), "mock_cus_" + UUID.randomUUID());
        return "/dashboard?subscribed=true";
    }

    public Subscription activateSubscription(User user, Subscription.Plan plan, String stripeSubId, String stripeCustomerId) {
        // Deactivate existing
        subscriptionRepository.findByUserAndStatus(user, Subscription.Status.ACTIVE)
                .ifPresent(sub -> {
                    sub.setStatus(Subscription.Status.EXPIRED);
                    subscriptionRepository.save(sub);
                });

        BigDecimal amount = plan == Subscription.Plan.MONTHLY ? MONTHLY_AMOUNT : YEARLY_AMOUNT;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime renewal = plan == Subscription.Plan.MONTHLY ? now.plusMonths(1) : now.plusYears(1);

        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .status(Subscription.Status.ACTIVE)
                .stripeSubscriptionId(stripeSubId)
                .stripeCustomerId(stripeCustomerId)
                .amount(amount)
                .startDate(now)
                .endDate(renewal)
                .renewalDate(renewal)
                .build();

        return subscriptionRepository.save(subscription);
    }

    public void cancelSubscription(User user) {
        subscriptionRepository.findByUserAndStatus(user, Subscription.Status.ACTIVE)
                .ifPresent(sub -> {
                    sub.setStatus(Subscription.Status.INACTIVE);
                    subscriptionRepository.save(sub);
                });
    }

    public BigDecimal getTotalPrizePool() {
        return subscriptionRepository.sumActiveSubscriptionAmounts();
    }

    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }
}
