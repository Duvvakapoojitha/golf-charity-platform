package com.golf.repository;

import com.golf.model.Charity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CharityRepository extends JpaRepository<Charity, UUID> {
    List<Charity> findByIsActiveTrue();
    List<Charity> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String name, String category);
    List<Charity> findByCategory(String category);
}
