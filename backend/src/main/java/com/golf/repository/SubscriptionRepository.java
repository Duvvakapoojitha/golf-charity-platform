package com.golf.repository;

import com.golf.model.Subscription;
import com.golf.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findTopByUserOrderByCreatedAtDesc(User user);
    Optional<Subscription> findByUserAndStatus(User user, Subscription.Status status);
    List<Subscription> findByStatus(Subscription.Status status);

    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Subscription s WHERE s.status = 'ACTIVE'")
    BigDecimal sumActiveSubscriptionAmounts();

    long countByStatus(Subscription.Status status);
}
