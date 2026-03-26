package com.golf.service;

import com.golf.dto.ParticipationSummaryDto;
import com.golf.model.Charity;
import com.golf.model.User;
import com.golf.repository.CharityRepository;
import com.golf.repository.ScoreRepository;
import com.golf.repository.SubscriptionRepository;
import com.golf.repository.UserRepository;
import com.golf.repository.WinnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final CharityRepository charityRepository;
    private final ScoreRepository scoreRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final WinnerRepository winnerRepository;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateProfile(String email, Map<String, Object> updates) {
        User user = getByEmail(email);

        if (updates.containsKey("fullName")) {
            user.setFullName((String) updates.get("fullName"));
        }
        if (updates.containsKey("donationPercentage")) {
            int pct = (Integer) updates.get("donationPercentage");
            if (pct < 10 || pct > 100) throw new RuntimeException("Donation percentage must be between 10 and 100");
            user.setDonationPercentage(pct);
        }
        if (updates.containsKey("charityId")) {
            UUID charityId = UUID.fromString((String) updates.get("charityId"));
            Charity charity = charityRepository.findById(charityId)
                    .orElseThrow(() -> new RuntimeException("Charity not found"));
            user.setCharity(charity);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    public ParticipationSummaryDto getParticipationSummary(User user) {
        long scoreCount = scoreRepository.countByUser(user);
        boolean subscribed = subscriptionRepository
                .findByUserAndStatus(user, com.golf.model.Subscription.Status.ACTIVE).isPresent();

        var winnings = winnerRepository.findByUser(user);
        long totalWins = winnings.size();
        BigDecimal totalWon = winnings.stream()
                .map(w -> w.getPrizeAmount() != null ? w.getPrizeAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long pending = winnings.stream()
                .filter(w -> w.getPaymentStatus() == com.golf.model.Winner.PaymentStatus.PENDING)
                .count();

        // Count draws this user was eligible for (subscribed at time of draw)
        long drawsEntered = subscribed ? winnerRepository.countDistinctDrawsByUser(user) : 0;

        return ParticipationSummaryDto.builder()
                .totalDrawsEntered(drawsEntered)
                .totalWins(totalWins)
                .totalWon(totalWon)
                .pendingPayments(pending)
                .hasActiveSubscription(subscribed)
                .currentScoreCount((int) scoreCount)
                .nextDrawInfo("Monthly draw runs at the end of each month")
                .build();
    }
}
