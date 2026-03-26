package com.golf.repository;

import com.golf.model.Draw;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DrawRepository extends JpaRepository<Draw, UUID> {
    List<Draw> findAllByOrderByDrawDateDesc();
    Optional<Draw> findTopByStatusOrderByDrawDateDesc(Draw.Status status);
    List<Draw> findByStatus(Draw.Status status);
}
