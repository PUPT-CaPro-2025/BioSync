package com.example.biosyncapi.schedule.schedule_student;

import com.example.biosyncapi.user.User;
import com.example.biosyncapi.schedule.Schedule;
import jakarta.persistence.*;

@Entity
@Table(name = "schedule_students")
public class ScheduleStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private boolean hasLogged;

    public ScheduleStudent() {}

    public ScheduleStudent(Schedule schedule, User student) {
        this.schedule = schedule;
        this.student = student;
        this.hasLogged = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public boolean isHasLogged() {
        return hasLogged;
    }

    public void setHasLogged(boolean hasLogged) {
        this.hasLogged = hasLogged;
    }
}
