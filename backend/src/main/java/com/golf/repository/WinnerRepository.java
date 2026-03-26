package com.golf.repository;

import com.golf.model.Draw;
import com.golf.model.User;
import com.golf.model.Winner;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface WinnerRepository extends JpaRepository<Winner, UUID> {

    @EntityGraph(attributePaths = {"user", "draw"})
    List<Winner> findByDraw(Draw draw);

    @EntityGraph(attributePaths = {"user", "draw"})
    List<Winner> findByUser(User user);

    @EntityGraph(attributePaths = {"user", "draw"})
    List<Winner> findByPaymentStatus(Winner.PaymentStatus status);

    @EntityGraph(attributePaths = {"user", "draw"})
    List<Winner> findAll();

    @Query("SELECT COALESCE(SUM(w.prizeAmount), 0) FROM Winner w WHERE w.paymentStatus = 'PAID'")
    BigDecimal sumPaidPrizes();

    @Query("SELECT COUNT(DISTINCT w.draw) FROM Winner w WHERE w.user = :user")
    long countDistinctDrawsByUser(@org.springframework.data.repository.query.Param("user") User user);

    List<Winner> findByDrawAndMatchCount(Draw draw, Integer matchCount);
}
