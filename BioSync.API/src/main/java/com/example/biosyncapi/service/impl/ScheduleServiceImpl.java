package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Schedule;
import com.example.biosyncapi.model.Subject;
import com.example.biosyncapi.repository.ScheduleRepository;
import com.example.biosyncapi.repository.SubjectRepository;
import com.example.biosyncapi.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SubjectRepository subjectRepository;

    public ScheduleServiceImpl(ScheduleRepository scheduleRepository, SubjectRepository subjectRepository) {
        this.scheduleRepository = scheduleRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @Override
    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }

    @Override
    public Schedule createSchedule(Schedule schedule) {
        Subject subject = subjectRepository
                .findById(schedule.getSubject().getId())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND)
                );

        schedule.setSubject(subject);

        List<Schedule> conflictingSchedule =
                scheduleRepository.findConflictingSchedules(
                        schedule.getScheduleDate(),
                        schedule.getStartTime(),
                        schedule.getEndTime()
                );

        if(!conflictingSchedule.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }

        return scheduleRepository.save(schedule);
    }

    @Override
    public Schedule updateSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Override
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
}
