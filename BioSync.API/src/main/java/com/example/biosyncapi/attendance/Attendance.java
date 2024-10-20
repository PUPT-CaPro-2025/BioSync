package com.example.biosyncapi.attendance;

import com.example.biosyncapi.schedule.Schedule;
import com.example.biosyncapi.user.User;
import jakarta.persistence.*;

import java.time.ZonedDateTime;

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

  private ZonedDateTime timeIn;

  private ZonedDateTime timeOut;

  public Attendance() {
  }

  public Attendance(
      String status, User user, Schedule schedule, ZonedDateTime timeIn)
  {
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

  public ZonedDateTime getTimeIn() {
    return timeIn;
  }

  public ZonedDateTime getTimeOut() {
    return timeOut;
  }

  public void setTimeOut(ZonedDateTime timeOut) {
    this.timeOut = timeOut;
  }
}
