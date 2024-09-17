package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByScheduleId(Long scheduleId);
    Long countByUserIdAndStatus(Long userId, String status);
    List<Attendance> findByScheduleIdAndUserId(Long scheduleId, Long userId);
}
