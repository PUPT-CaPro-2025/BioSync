package com.example.biosyncapi.fingerprint;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FingerprintRepository extends JpaRepository<Fingerprint, Long> {
    List<Fingerprint> getAllByUserId(Long userId);
    @Transactional
    void deleteByUserId(Long userId);
}
