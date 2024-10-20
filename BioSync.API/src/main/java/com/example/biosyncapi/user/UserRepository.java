package com.example.biosyncapi.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsercode(String usercode);

  User findById(long id);

  boolean existsByUsercode(String usercode);

  boolean existsByEmail(String email);

  List<User> findBySectionId(Long sectionId);

  User findByEmail(String email);

  @Query("SELECT u FROM User u WHERE u.id = :userId")
  User findByUserId(Long userId);

  @Query("SELECT u FROM User u WHERE u.role = :role")
  List<User> getUsersByRole(Role role);
}
