package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Schedule;
import com.example.biosyncapi.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public List<Schedule> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/professor/{id}")
    public List<Schedule> getSchedulesByProfessorId(@PathVariable Long id) {
        return scheduleService.getAllSchedulesByProfessorId(id);
    }

    @GetMapping("/section/{id}")
    public List<Schedule> getSchedulesBySectionId(@PathVariable Long id) {
        return scheduleService.getAllSchedulesBySectionId(id);
    }

    @GetMapping("/recurrence/{id}")
    public ResponseEntity<List<Schedule>> getSchedulesByRecurrenceId(@PathVariable UUID id) {
        List<Schedule> schedules = scheduleService.getSchedulesByRecurrenceId(id);

        if(schedules.isEmpty()) return new ResponseEntity<>(HttpStatus.NO_CONTENT);

        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public Optional<Schedule> getScheduleById(@PathVariable Long id) {
        return scheduleService.getScheduleById(id);
    }

    @PostMapping
    public ResponseEntity<List<Schedule>> createSchedule(@RequestBody Schedule schedule) {
        try{
            List<Schedule> createdSchedule = scheduleService.createSchedule(schedule);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSchedule);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping
    public Schedule updateSchedule(@RequestBody Schedule schedule) {
        return scheduleService.updateSchedule(schedule);
    }

    @DeleteMapping
    public void deleteSchedule(@RequestBody Schedule schedule) {
        scheduleService.deleteSchedule(schedule.getId());
    }
}
