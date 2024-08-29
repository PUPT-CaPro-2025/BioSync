package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Schedule;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.sql.Time;
import java.util.List;
import java.util.UUID;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    @Query("SELECT s FROM Schedule s WHERE s.scheduleDate = :scheduleDate AND s.startTime < :endTime AND s.endTime > :startTime")
    List<Schedule> findConflictingSchedules(@Param("scheduleDate") Date scheduleDate, @Param("startTime") Time startTime, @Param("endTime") Time endTime);

    @Modifying
    @Transactional
    @Query("DELETE FROM Schedule WHERE recurrenceId = :recurrenceId")
    void deleteByRecurrenceId(UUID recurrenceId);
}
