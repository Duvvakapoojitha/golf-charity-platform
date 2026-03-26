package com.golf.repository;

import com.golf.model.Score;
import com.golf.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScoreRepository extends JpaRepository<Score, UUID> {
    List<Score> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT s FROM Score s WHERE s.user = :user ORDER BY s.createdAt DESC")
    List<Score> findTop5ByUserOrderByCreatedAtDesc(User user);

    long countByUser(User user);

    @Query("SELECT s.score, COUNT(s) as freq FROM Score s GROUP BY s.score ORDER BY freq DESC")
    List<Object[]> findScoreFrequencies();

    @Query("SELECT s FROM Score s WHERE s.user.id IN :userIds ORDER BY s.createdAt DESC")
    List<Score> findAllActiveUserScores(@Param("userIds") List<UUID> userIds);
}
