package com.example.biosyncapi.attendance;

import com.example.biosyncapi.user.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByScheduleId(Long scheduleId);
    Long countByUserIdAndStatus(Long userId, String status);
    List<Attendance> findByScheduleIdAndUserId(Long scheduleId, Long userId);
    @Transactional
    @Modifying
    void deleteByUserId(Long userId);
    @Query("SELECT a.user FROM Attendance a WHERE a.schedule.id = :scheduleId")
    List<User> getStudentsByScheduleId(@Param("scheduleId") Long scheduleId);
}
