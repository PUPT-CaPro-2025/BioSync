package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
}
