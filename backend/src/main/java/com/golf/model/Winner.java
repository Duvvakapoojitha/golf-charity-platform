package com.golf.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "winners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Winner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draw_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "numbersJson"})
    private Draw draw;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "charity"})
    private User user;

    @Column(name = "match_count", nullable = false)
    private Integer matchCount;

    @Column(name = "prize_amount", nullable = false)
    private BigDecimal prizeAmount;

    @Column(name = "charity_donation")
    private BigDecimal charityDonation;

    @Column(name = "net_prize")
    private BigDecimal netPrize;

    @Column(name = "proof_url")
    private String proofUrl;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "admin_notes")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PaymentStatus {
        PENDING, APPROVED, PAID
    }
}
