package com.example.biosyncapi.schedule;

import com.example.biosyncapi.laboratory.Laboratory;
import com.example.biosyncapi.school_year.SchoolYear;
import com.example.biosyncapi.section.Section;
import com.example.biosyncapi.semester.Semester;
import com.example.biosyncapi.subject.Subject;
import com.example.biosyncapi.user.User;
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
    @Query("SELECT s FROM Schedule s WHERE s.recurrenceId = :recurrenceId")
    List<Schedule> getSchedulesByRecurrenceId(UUID recurrenceId);

    List<Schedule> findByIsActiveTrueAndStatus(Status status);

    List<Schedule> findByRequesterId(Long requesterId);

    List<Schedule> findAllByStatus(Status status);

    @Query("SELECT s FROM Schedule s WHERE s.scheduleDate = :scheduleDate " +
        "AND s.status = 'APPROVED' AND s.laboratory = :laboratory AND s" +
        ".startTime <" +
        " :endTime" +
        " AND " +
        "s.endTime > :startTime AND s.schoolYear = :schoolYear")
    List<Schedule> findConflictingSchedules(
            @Param("scheduleDate") Date scheduleDate,
            @Param("startTime") Time startTime,
            @Param("endTime") Time endTime,
            @Param("laboratory") Laboratory laboratory,
            @Param("schoolYear") SchoolYear schoolYear);

    @Query("SELECT s FROM Schedule s WHERE s.recurrenceId = :recurrenceId")
    List<Schedule> findByRecurrenceId(@Param("recurrenceId") UUID recurrenceId);

    @Query("SELECT s FROM Schedule s WHERE s.professor.id = :professorId AND s.isActive = true AND s.status = 'APPROVED'")
    List<Schedule> findSchedulesByProfessorId(@Param("professorId") Long professorId);

    @Query("SELECT s FROM Schedule s WHERE s.section.id = :sectionId")
    List<Schedule> findSchedulesBySectionId(@Param("sectionId") Long sectionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Schedule WHERE recurrenceId = :recurrenceId")
    void deleteByRecurrenceId(UUID recurrenceId);

    @Modifying
    @Transactional
    @Query("UPDATE Schedule s SET s.startTime = :startTime, " +
            "s.endTime = :endTime, " +
            "s.subject = :subject, " +
            "s.section = :section, " +
            "s.laboratory = :laboratory, " +
            "s.professor = :professor, " +
            "s.semester = :semester, " +
            "s.remarks = :remarks, " +
            "s.recurrence = :recurrence, " +
            "s.recurrenceInterval = :recurrenceInterval " +
            "WHERE s.recurrenceId = :recurrenceId")
    int updateSchedule(
            @Param("recurrenceId") UUID recurrenceId,
            @Param("startTime") Time startTime,
            @Param("endTime") Time endTime,
            @Param("subject") Subject subject,
            @Param("section") Section section,
            @Param("laboratory") Laboratory laboratory,
            @Param("professor") User professor,
            @Param("semester") Semester semester,
            @Param("remarks") String remarks,
            @Param("recurrence") Recurrence recurrence,
            @Param("recurrenceInterval") int recurrenceInterval
    );

    @Modifying
    @Transactional
    @Query(value = "UPDATE schedule_days SET recurrence_days = :days WHERE schedule_id = :scheduleId", nativeQuery = true)
    void updateRecurrenceDays(@Param("scheduleId") Long scheduleId, @Param("days") String days);

}
