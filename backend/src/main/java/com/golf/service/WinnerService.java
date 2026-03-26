package com.golf.service;

import com.golf.model.User;
import com.golf.model.Winner;
import com.golf.repository.WinnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WinnerService {

    private final WinnerRepository winnerRepository;
    private final EmailService emailService;

    public List<Winner> getUserWinnings(User user) {
        return winnerRepository.findByUser(user);
    }

    public List<Winner> getAllWinners() {
        return winnerRepository.findAll();
    }

    public List<Winner> getPendingVerification() {
        return winnerRepository.findByPaymentStatus(Winner.PaymentStatus.PENDING);
    }

    @Transactional
    public Winner uploadProof(UUID winnerId, User user, String proofUrl) {
        Winner winner = winnerRepository.findById(winnerId)
                .orElseThrow(() -> new RuntimeException("Winner record not found"));
        if (!winner.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }
        winner.setProofUrl(proofUrl);
        return winnerRepository.save(winner);
    }

    @Transactional
    public Winner updatePaymentStatus(UUID winnerId, Winner.PaymentStatus status, String notes) {
        Winner winner = winnerRepository.findById(winnerId)
                .orElseThrow(() -> new RuntimeException("Winner record not found"));

        winner.setPaymentStatus(status);
        if (notes != null && !notes.isBlank()) winner.setAdminNotes(notes);

        // When approving — calculate charity donation and net prize
        if (status == Winner.PaymentStatus.APPROVED) {
            calculateDonation(winner);
            winnerRepository.save(winner);
            emailService.sendWinnerApprovedEmail(winner);
        }

        // When marking paid — send payment confirmation
        if (status == Winner.PaymentStatus.PAID) {
            if (winner.getNetPrize() == null) calculateDonation(winner);
            winnerRepository.save(winner);
            emailService.sendPaymentConfirmationEmail(winner);
        }

        return winnerRepository.save(winner);
    }

    private void calculateDonation(Winner winner) {
        User user = winner.getUser();
        int donationPct = user.getDonationPercentage() != null ? user.getDonationPercentage() : 10;
        BigDecimal prize = winner.getPrizeAmount();

        BigDecimal donation = prize
                .multiply(new BigDecimal(donationPct))
                .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);

        BigDecimal netPrize = prize.subtract(donation);

        winner.setCharityDonation(donation);
        winner.setNetPrize(netPrize);
    }
}
