package com.example.biosyncapi.attendance;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByScheduleId(Long scheduleId);
    Long countByUserIdAndStatus(Long userId, String status);
    List<Attendance> findByScheduleIdAndUserId(Long scheduleId, Long userId);
    @Transactional
    @Modifying
    void deleteByUserId(Long userId);
}
