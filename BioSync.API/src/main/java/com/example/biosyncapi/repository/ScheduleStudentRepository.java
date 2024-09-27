package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.ScheduleStudent;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleStudentRepository extends JpaRepository<ScheduleStudent, Long> {
    List<ScheduleStudent> findByScheduleIdAndHasLoggedFalse(Long scheduleId);
    List<ScheduleStudent> findByScheduleId(Long scheduleId);
    ScheduleStudent findByStudentIdAndScheduleId(Long student_id, Long schedule_id);
    @Transactional
    void deleteByScheduleId(Long scheduleId);
}