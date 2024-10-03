package com.example.biosyncapi.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsercode(String usercode);
    boolean existsByUsercode(String usercode);
    List<User> findBySectionId(Long sectionId);

    @Query("SELECT u FROM User u WHERE u.id = :userId")
    User findByUserId(Long userId);

    @Query("SELECT u FROM User u WHERE u.role = :role")
    List<User> getUsersByRole(Role role);
}
