package com.golf.repository;

import com.golf.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @EntityGraph(attributePaths = {"charity"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"charity"})
    Optional<User> findById(UUID id);

    boolean existsByEmail(String email);
    long countByRole(User.Role role);
}
