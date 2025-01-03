package com.example.biosyncapi.fingerprint;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FingerprintRepository extends JpaRepository<Fingerprint, Long> {
    List<Fingerprint> getAllByUserId(Long userId);
    @Transactional
    void deleteByUserId(Long userId);

    @Query("SELECT f FROM Fingerprint f WHERE f.user.id IN :userIds")
    List<Fingerprint> getAllByUserIds(@Param("userIds") List<Long> userIds);

    @Query(value = "SELECT * FROM fingerprint f " +
            "WHERE f.id IN (" +
            "  SELECT MIN(f2.id) FROM fingerprint f2 WHERE f2.user_id IN :userIds GROUP BY f2.user_id" +
            ")", nativeQuery = true)
    List<Fingerprint> getOneFingerprintPerUser(@Param("userIds") List<Long> userIds);

}
