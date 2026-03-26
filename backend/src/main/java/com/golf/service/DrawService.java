package com.golf.service;

import com.golf.dto.DrawRequest;
import com.golf.model.*;
import com.golf.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrawService {

    private final DrawRepository drawRepository;
    private final ScoreRepository scoreRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final WinnerRepository winnerRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final BigDecimal JACKPOT_PCT = new BigDecimal("0.40");
    private static final BigDecimal FOUR_MATCH_PCT = new BigDecimal("0.35");
    private static final BigDecimal THREE_MATCH_PCT = new BigDecimal("0.25");

    public List<Draw> getAllDraws() {
        return drawRepository.findAllByOrderByDrawDateDesc();
    }

    public Draw getById(UUID id) {
        return drawRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draw not found"));
    }

    @Transactional
    public Draw createDraw(DrawRequest request) {
        List<Integer> numbers = generateNumbers(request.getDrawType());
        BigDecimal prizePool = subscriptionRepository.sumActiveSubscriptionAmounts();

        // Add rollover from previous unpaid jackpot
        BigDecimal rollover = getLastRollover();

        Draw draw = Draw.builder()
                .drawDate(LocalDateTime.now())
                .drawType(request.getDrawType())
                .status(Draw.Status.PENDING)
                .totalPrizePool(prizePool.add(rollover))
                .rolloverAmount(rollover)
                .jackpotAmount(prizePool.add(rollover).multiply(JACKPOT_PCT).setScale(2, RoundingMode.HALF_UP))
                .fourMatchAmount(prizePool.multiply(FOUR_MATCH_PCT).setScale(2, RoundingMode.HALF_UP))
                .threeMatchAmount(prizePool.multiply(THREE_MATCH_PCT).setScale(2, RoundingMode.HALF_UP))
                .build();

        draw.setNumbers(numbers);
        return drawRepository.save(draw);
    }

    @Transactional
    public Draw simulateDraw(UUID drawId) {
        Draw draw = getById(drawId);
        processWinners(draw);
        draw.setStatus(Draw.Status.SIMULATED);
        return drawRepository.save(draw);
    }

    @Transactional
    public Draw publishDraw(UUID drawId) {
        Draw draw = getById(drawId);
        // Always re-process winners so new scores are picked up
        processWinners(draw);
        draw.setStatus(Draw.Status.PUBLISHED);
        return drawRepository.save(draw);
    }

    private void processWinners(Draw draw) {
        // Remove previous simulation winners
        winnerRepository.findByDraw(draw).forEach(winnerRepository::delete);

        Set<Integer> drawNumbers = new HashSet<>(draw.getNumbers());

        // Get all active subscribers
        List<Subscription> activeSubs = subscriptionRepository.findByStatus(Subscription.Status.ACTIVE);
        List<UUID> activeUserIds = activeSubs.stream()
                .map(s -> s.getUser().getId()).collect(Collectors.toList());

        if (activeUserIds.isEmpty()) return;

        // Get scores for active users
        List<Score> allScores = scoreRepository.findAllActiveUserScores(activeUserIds);

        // Group scores by user
        Map<UUID, Set<Integer>> userScores = new HashMap<>();
        for (Score s : allScores) {
            userScores.computeIfAbsent(s.getUser().getId(), k -> new HashSet<>()).add(s.getScore());
        }

        List<Winner> jackpotWinners = new ArrayList<>();
        List<Winner> fourMatchWinners = new ArrayList<>();
        List<Winner> threeMatchWinners = new ArrayList<>();

        for (Map.Entry<UUID, Set<Integer>> entry : userScores.entrySet()) {
            Set<Integer> intersection = new HashSet<>(entry.getValue());
            intersection.retainAll(drawNumbers);
            int matchCount = intersection.size();

            if (matchCount >= 3) {
                User user = userRepository.findById(entry.getKey()).orElse(null);
                if (user == null) continue;

                Winner winner = Winner.builder()
                        .draw(draw)
                        .user(user)
                        .matchCount(matchCount)
                        .prizeAmount(BigDecimal.ZERO) // calculated after grouping
                        .paymentStatus(Winner.PaymentStatus.PENDING)
                        .build();

                if (matchCount == 5) jackpotWinners.add(winner);
                else if (matchCount == 4) fourMatchWinners.add(winner);
                else threeMatchWinners.add(winner);
            }
        }

        // Distribute prizes
        distributeAndSave(jackpotWinners, draw.getJackpotAmount(), draw);
        distributeAndSave(fourMatchWinners, draw.getFourMatchAmount(), draw);
        distributeAndSave(threeMatchWinners, draw.getThreeMatchAmount(), draw);

        // Handle jackpot rollover
        if (jackpotWinners.isEmpty()) {
            draw.setRolloverAmount(draw.getJackpotAmount());
        }
    }

    private void distributeAndSave(List<Winner> winners, BigDecimal pool, Draw draw) {
        if (winners.isEmpty()) return;
        BigDecimal share = pool.divide(new BigDecimal(winners.size()), 2, RoundingMode.HALF_UP);
        List<Integer> drawNumbers = draw.getNumbers();
        int[] numbersArr = drawNumbers.stream().mapToInt(Integer::intValue).toArray();
        for (Winner w : winners) {
            w.setPrizeAmount(share);
            winnerRepository.save(w);
            // Send email notification to each winner
            emailService.sendDrawResultEmail(w.getUser(), w.getMatchCount(), share, numbersArr);
        }
    }

    private List<Integer> generateNumbers(Draw.DrawType type) {
        if (type == Draw.DrawType.ALGORITHM) {
            return generateAlgorithmNumbers();
        }
        return generateRandomNumbers();
    }

    private List<Integer> generateRandomNumbers() {
        Random random = new Random();
        Set<Integer> numbers = new LinkedHashSet<>();
        while (numbers.size() < 5) {
            numbers.add(random.nextInt(45) + 1);
        }
        return new ArrayList<>(numbers);
    }

    private List<Integer> generateAlgorithmNumbers() {
        List<Object[]> frequencies = scoreRepository.findScoreFrequencies();
        Set<Integer> numbers = new LinkedHashSet<>();

        for (Object[] row : frequencies) {
            if (numbers.size() >= 5) break;
            numbers.add(((Number) row[0]).intValue());
        }

        Random random = new Random();
        while (numbers.size() < 5) {
            numbers.add(random.nextInt(45) + 1);
        }

        return new ArrayList<>(numbers);
    }

    private BigDecimal getLastRollover() {
        return drawRepository.findTopByStatusOrderByDrawDateDesc(Draw.Status.PUBLISHED)
                .map(Draw::getRolloverAmount)
                .orElse(BigDecimal.ZERO);
    }

    public List<Winner> getDrawWinners(UUID drawId) {
        Draw draw = getById(drawId);
        return winnerRepository.findByDraw(draw);
    }
}
