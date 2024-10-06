package com.example.biosyncapi.attendance;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudentRepository;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ScheduleStudentRepository scheduleStudentRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository, ScheduleStudentRepository scheduleStudentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.scheduleStudentRepository = scheduleStudentRepository;
    }

    @Override
    public List<Attendance> getAttendanceByScheduleId(Long scheduleId) {
        return attendanceRepository.findByScheduleId(scheduleId);
    }

    @Override
    public Long getAttendanceCountByStudentId(Long studentId) {
        return attendanceRepository.countByUserIdAndStatus(studentId, "PRESENT");
    }

    @Override
    public Long getAbsentCountByStudentId(Long studentId) {
        return attendanceRepository.countByUserIdAndStatus(studentId, "ABSENT");
    }

    @Override
    public Attendance saveAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance updateAttendance(Attendance attendance) {
        Optional<Attendance> existingAttendance = attendanceRepository.findById(attendance.getId());

        if (existingAttendance.isEmpty()) return null;

        Attendance updatedAttendance = existingAttendance.get();
        updatedAttendance.setStatus(attendance.getStatus());
        updatedAttendance.setUser(attendance.getUser());
        updatedAttendance.setSchedule(attendance.getSchedule());

        return attendanceRepository.save(updatedAttendance);
    }

    @Override
    public void setTimeOut(Schedule schedule) {
        List<ScheduleStudent> scheduleStudents = scheduleStudentRepository.findByScheduleId(schedule.getId());

        List<Attendance> existingAttendances = attendanceRepository.findByScheduleId(schedule.getId());

        Set<Long> studentsWithAttendance = existingAttendances.stream()
                .map(attendance -> attendance.getUser().getId())
                .collect(Collectors.toSet());

        for (ScheduleStudent scheduleStudent : scheduleStudents) {
            User student = scheduleStudent.getStudent();

            if (studentsWithAttendance.contains(student.getId())) {
                Attendance existingAttendance = existingAttendances.stream()
                        .filter(attendance -> attendance.getUser().getId().equals(student.getId()))
                        .findFirst()
                        .orElse(null);

                if (existingAttendance != null) {
                    existingAttendance.setTimeOut(ZonedDateTime.now(ZoneId.of("UTC+8")));
                    attendanceRepository.save(existingAttendance);
                }
            } else {
                Attendance absentAttendance = new Attendance();
                absentAttendance.setStatus("ABSENT");
                absentAttendance.setUser(student);
                absentAttendance.setSchedule(schedule);
                attendanceRepository.save(absentAttendance);
            }
        }
    }
}
