package com.example.biosyncapi.model;

import jakarta.persistence.*;

import java.sql.Time;
import java.sql.Date;


@Entity
@Table(name="schedules")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="subject_id", nullable=false)
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

    public Schedule() {
    }

    public Schedule(Long id, Subject subject, Section section, Time startTime, Time endTime, Date scheduleDate, Laboratory laboratory, User professor, SchoolYear schoolYear, Semester semester, String remarks) {
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
}
