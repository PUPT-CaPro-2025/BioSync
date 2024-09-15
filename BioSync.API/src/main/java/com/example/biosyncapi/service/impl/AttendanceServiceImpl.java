package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Attendance;
import com.example.biosyncapi.model.Schedule;
import com.example.biosyncapi.model.User;
import com.example.biosyncapi.repository.AttendanceRepository;
import com.example.biosyncapi.repository.UserRepository;
import com.example.biosyncapi.service.AttendanceService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository, UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
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
    public void markAttendanceAsAbsent(Schedule schedule) {
        List<User> studentsInSection = userRepository.findBySectionId(schedule.getSection().getId());
        List<Attendance> existingAttendances = attendanceRepository.findByScheduleId(schedule.getId());

        for (User student : studentsInSection) {
            boolean hasAttendance = existingAttendances.stream()
                    .anyMatch(attendance -> attendance.getUser().getId().equals(student.getId()));

            if (!hasAttendance) {
                Attendance absentAttendance = new Attendance();
                absentAttendance.setStatus("ABSENT");
                absentAttendance.setUser(student);
                absentAttendance.setSchedule(schedule);
                attendanceRepository.save(absentAttendance);
            }
        }
    }
}
