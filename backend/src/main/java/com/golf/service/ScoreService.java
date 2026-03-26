package com.golf.service;

import com.golf.dto.ScoreRequest;
import com.golf.model.Score;
import com.golf.model.User;
import com.golf.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScoreService {

    private static final int MAX_SCORES = 5;
    private final ScoreRepository scoreRepository;

    @Transactional
    public Score addScore(User user, ScoreRequest request) {
        // Enforce max 5 scores: delete oldest if needed
        List<Score> existing = scoreRepository.findByUserOrderByCreatedAtDesc(user);
        if (existing.size() >= MAX_SCORES) {
            // Delete the oldest (last in desc list)
            Score oldest = existing.get(existing.size() - 1);
            scoreRepository.delete(oldest);
        }

        Score score = Score.builder()
                .user(user)
                .score(request.getScore())
                .scoreDate(request.getScoreDate())
                .build();

        return scoreRepository.save(score);
    }

    public List<Score> getUserScores(User user) {
        return scoreRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public Score updateScore(UUID scoreId, User user, ScoreRequest request) {
        Score score = scoreRepository.findById(scoreId)
                .orElseThrow(() -> new RuntimeException("Score not found"));

        if (!score.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to update this score");
        }

        score.setScore(request.getScore());
        score.setScoreDate(request.getScoreDate());
        return scoreRepository.save(score);
    }

    @Transactional
    public void deleteScore(UUID scoreId, User user) {
        Score score = scoreRepository.findById(scoreId)
                .orElseThrow(() -> new RuntimeException("Score not found"));

        if (!score.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this score");
        }

        scoreRepository.delete(score);
    }
}
