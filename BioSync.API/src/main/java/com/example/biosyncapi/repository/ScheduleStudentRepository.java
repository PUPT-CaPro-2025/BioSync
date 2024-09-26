package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.ScheduleStudent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleStudentRepository extends JpaRepository<ScheduleStudent, Long> {
    List<ScheduleStudent> findByScheduleIdAndHasLoggedFalse(Long scheduleId);
    List<ScheduleStudent> findByScheduleId(Long scheduleId);
    ScheduleStudent findByStudentId(Long studentId);
}