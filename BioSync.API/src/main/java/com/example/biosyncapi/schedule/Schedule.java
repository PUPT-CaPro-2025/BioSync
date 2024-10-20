package com.example.biosyncapi.schedule;

import com.example.biosyncapi.laboratory.Laboratory;
import com.example.biosyncapi.schedule.schedule_student.ScheduleStudent;
import com.example.biosyncapi.school_year.SchoolYear;
import com.example.biosyncapi.section.Section;
import com.example.biosyncapi.semester.Semester;
import com.example.biosyncapi.subject.Subject;
import com.example.biosyncapi.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.sql.Time;
import java.sql.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "schedules")
public class Schedule {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "subject_id", nullable = false)
  private Subject subject;

  @ManyToOne
  private Section section;

  private Time startTime;

  private Time endTime;

  private Date scheduleDate;

  @ManyToOne
  private Laboratory laboratory;

  @ManyToOne
  @JoinColumn(name = "professor_id", nullable = false)
  private User professor;

  @ManyToOne
  @JoinColumn(name = "school_year_id", nullable = false)
  private SchoolYear schoolYear;

  @ManyToOne
  private Semester semester;

  private String remarks;

  private UUID recurrenceId;

  @Enumerated(EnumType.STRING)
  private Recurrence recurrence;

  private int recurrenceInterval;

  private boolean hasFinished;

  @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonIgnore
  private List<ScheduleStudent> scheduleStudents;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "schedule_days", joinColumns = @JoinColumn(name = "schedule_id"))
  public List<String> recurrenceDays;

  @Enumerated(value = EnumType.STRING)
  public Status status;

  public boolean isActive;

  @ManyToOne
  @JoinColumn(name = "requester_id")
  public User requester;

  public Schedule() {
    this.isActive = true;
  }

  public Schedule(Long id, Subject subject, Section section, Time startTime, Time endTime, Date scheduleDate,
      Laboratory laboratory, User professor, SchoolYear schoolYear, Semester semester, String remarks,
      UUID recurrenceId, Recurrence recurrence, int recurrenceInterval, List<ScheduleStudent> students,
      List<String> recurrenceDays, Status status) {
    this.id = id;
    this.subject = subject;
    this.section = section;
    this.startTime = startTime;
    this.endTime = endTime;
    this.scheduleDate = scheduleDate;
    this.laboratory = laboratory;
    this.professor = professor;
    this.schoolYear = schoolYear;
    this.semester = semester;
    this.remarks = remarks;
    this.recurrenceId = recurrenceId;
    this.recurrence = recurrence;
    this.recurrenceInterval = recurrenceInterval;
    this.scheduleStudents = students;
    this.recurrenceDays = recurrenceDays;
    this.status = status;
    this.isActive = true;
    this.hasFinished = false;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Subject getSubject() {
    return subject;
  }

  public void setSubject(Subject subject) {
    this.subject = subject;
  }

  public Section getSection() {
    return section;
  }

  public void setSection(Section section) {
    this.section = section;
  }

  public Time getStartTime() {
    return startTime;
  }

  public void setStartTime(Time startTime) {
    this.startTime = startTime;
  }

  public Time getEndTime() {
    return endTime;
  }

  public void setEndTime(Time endTime) {
    this.endTime = endTime;
  }

  public Date getScheduleDate() {
    return scheduleDate;
  }

  public void setScheduleDate(Date scheduleDate) {
    this.scheduleDate = scheduleDate;
  }

  public User getProfessor() {
    return professor;
  }

  public void setProfessor(User professor) {
    this.professor = professor;
  }

  public Laboratory getLaboratory() {
    return laboratory;
  }

  public void setLaboratory(Laboratory laboratory) {
    this.laboratory = laboratory;
  }

  public Semester getSemester() {
    return semester;
  }

  public void setSemester(Semester semester) {
    this.semester = semester;
  }

  public SchoolYear getSchoolYear() {
    return schoolYear;
  }

  public void setSchoolYear(SchoolYear schoolYear) {
    this.schoolYear = schoolYear;
  }

  public String getRemarks() {
    return remarks;
  }

  public void setRemarks(String remarks) {
    this.remarks = remarks;
  }

  public Recurrence getRecurrence() {
    return recurrence;
  }

  public void setRecurrence(Recurrence recurrence) {
    this.recurrence = recurrence;
  }

  public int getRecurrenceInterval() {
    return recurrenceInterval;
  }

  public void setRecurrenceInterval(int recurrenceInterval) {
    this.recurrenceInterval = recurrenceInterval;
  }

  public List<String> getRecurrenceDays() {
    return recurrenceDays;
  }

  public void setRecurrenceDays(List<String> recurrenceDays) {
    this.recurrenceDays = recurrenceDays;
  }

  public UUID getRecurrenceId() {
    return recurrenceId;
  }

  public void setRecurrenceId(UUID recurrenceId) {
    this.recurrenceId = recurrenceId;
  }

  public boolean isHasFinished() {
    return hasFinished;
  }

  public void setHasFinished(boolean hasFinished) {
    this.hasFinished = hasFinished;
  }

  public List<ScheduleStudent> getScheduleStudents() {
    return scheduleStudents;
  }

  public void setScheduleStudents(List<ScheduleStudent> scheduleStudents) {
    this.scheduleStudents = scheduleStudents;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public boolean isActive() {
    return isActive;
  }

  public void setActive(boolean active) {
    isActive = active;
  }

  public User getRequester() {
    return requester;
  }

  public void setRequester(User requester) {
    this.requester = requester;
  }
}
