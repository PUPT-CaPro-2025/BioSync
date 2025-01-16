package com.example.biosyncapi.schedule.schedule_student;

import com.example.biosyncapi.user.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ScheduleStudentRepository
    extends JpaRepository<ScheduleStudent, Long>
{
  List<ScheduleStudent> findByScheduleIdAndHasLoggedFalse(Long scheduleId);

  List<ScheduleStudent> findByScheduleId(Long scheduleId);

  List<ScheduleStudent> findByStudentId(Long id);

  ScheduleStudent findByStudentIdAndScheduleId(
      Long student_id,
      Long schedule_id);

  @Transactional
  void deleteByScheduleId(Long scheduleId);

  @Transactional
  @Modifying
  @Query("DELETE FROM ScheduleStudent s WHERE s.student = :user")
  void deleteAllByUserId(User user);

}
