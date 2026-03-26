package com.golf.controller;

import com.golf.dto.ApiResponse;
import com.golf.dto.ScoreRequest;
import com.golf.model.Score;
import com.golf.model.User;
import com.golf.service.ScoreService;
import com.golf.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Score>>> getScores(Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(scoreService.getUserScores(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Score>> addScore(Principal principal,
                                                        @Valid @RequestBody ScoreRequest request) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Score added", scoreService.addScore(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Score>> updateScore(Principal principal,
                                                           @PathVariable UUID id,
                                                           @Valid @RequestBody ScoreRequest request) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Score updated", scoreService.updateScore(id, user, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteScore(Principal principal, @PathVariable UUID id) {
        User user = userService.getByEmail(principal.getName());
        scoreService.deleteScore(id, user);
        return ResponseEntity.ok(ApiResponse.success("Score deleted", null));
    }
}
