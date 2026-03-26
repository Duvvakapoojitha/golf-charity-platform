package com.golf.controller;

import com.golf.dto.ApiResponse;
import com.golf.dto.ScoreRequest;
import com.golf.model.Score;
import com.golf.model.Subscription;
import com.golf.model.User;
import com.golf.repository.ScoreRepository;
import com.golf.repository.SubscriptionRepository;
import com.golf.repository.UserRepository;
import com.golf.repository.WinnerRepository;
import com.golf.service.ScoreService;
import com.golf.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final WinnerRepository winnerRepository;
    private final ScoreRepository scoreRepository;
    private final ScoreService scoreService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    // Get scores for a specific user (admin view)
    @GetMapping("/users/{userId}/scores")
    public ResponseEntity<ApiResponse<List<Score>>> getUserScores(@PathVariable UUID userId) {
        User user = userService.getById(userId);
        return ResponseEntity.ok(ApiResponse.success(scoreService.getUserScores(user)));
    }

    // Admin edit a user's score
    @PutMapping("/scores/{scoreId}")
    public ResponseEntity<ApiResponse<Score>> editScore(@PathVariable UUID scoreId,
                                                         @Valid @RequestBody ScoreRequest request) {
        Score score = scoreRepository.findById(scoreId)
                .orElseThrow(() -> new RuntimeException("Score not found"));
        score.setScore(request.getScore());
        score.setScoreDate(request.getScoreDate());
        return ResponseEntity.ok(ApiResponse.success("Score updated", scoreRepository.save(score)));
    }

    // Admin delete a user's score
    @DeleteMapping("/scores/{scoreId}")
    public ResponseEntity<ApiResponse<Void>> deleteScore(@PathVariable UUID scoreId) {
        scoreRepository.deleteById(scoreId);
        return ResponseEntity.ok(ApiResponse.success("Score deleted", null));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<ApiResponse<List<Subscription>>> getSubscriptions() {
        return ResponseEntity.ok(ApiResponse.success(subscriptionRepository.findAll()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByRole(User.Role.USER);
        long activeSubs = subscriptionRepository.countByStatus(Subscription.Status.ACTIVE);
        BigDecimal prizePool = subscriptionRepository.sumActiveSubscriptionAmounts();
        BigDecimal paidOut = winnerRepository.sumPaidPrizes();
        long totalDraws = com.golf.model.Draw.Status.values().length; // placeholder

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "totalUsers", totalUsers,
                "activeUsers", activeUsers,
                "activeSubscriptions", activeSubs,
                "prizePool", prizePool,
                "totalPaidOut", paidOut
        )));
    }
}
