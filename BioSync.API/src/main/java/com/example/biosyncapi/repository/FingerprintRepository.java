package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Fingerprint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FingerprintRepository extends JpaRepository<Fingerprint, Long> {
    List<Fingerprint> getAllBySectionId(Long sectionId);
}
