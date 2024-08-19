package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsercode(String usercode);
}
