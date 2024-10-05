package com.example.biosyncapi.attendance;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Attendance {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String status;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "schedule_id", nullable = false)
  private Schedule schedule;

  private LocalDateTime timeIn;

  private LocalDateTime timeOut;

  public Attendance() {}

  public Attendance(String status, User user, Schedule schedule, LocalDateTime timeIn) {
    this.status = status;
    this.user = user;
    this.schedule = schedule;
    this.timeIn = timeIn;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public Schedule getSchedule() {
    return schedule;
  }

  public void setSchedule(Schedule schedule) {
    this.schedule = schedule;
  }

  public LocalDateTime getTimeIn() {
    return timeIn;
  }

  public LocalDateTime getTimeOut() {
    return timeOut;
  }

  public void setTimeOut(LocalDateTime timeOut) {
    this.timeOut = timeOut;
  }
}
