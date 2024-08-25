package com.example.biosyncapi.model;

import jakarta.persistence.*;

@Entity
public class SchoolYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int startYear;

    private int endYear;

    @ManyToOne
    private Semester firstSemester;

    @ManyToOne
    private Semester secondSemester;

    @ManyToOne
    private Semester summerSemester;

    public SchoolYear() {
    }

    public SchoolYear(Long id, int startYear, int endYear, Semester firstSemester, Semester secondSemester, Semester summerSemester) {
        this.id = id;
        this.startYear = startYear;
        this.endYear = endYear;
        this.firstSemester = firstSemester;
        this.secondSemester = secondSemester;
        this.summerSemester = summerSemester;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getStartYear() {
        return startYear;
    }

    public void setStartYear(int startYear) {
        this.startYear = startYear;
    }

    public int getEndYear() {
        return endYear;
    }

    public void setEndYear(int endYear) {
        this.endYear = endYear;
    }

    public Semester getFirstSemester() {
        return firstSemester;
    }

    public void setFirstSemester(Semester firstSemester) {
        this.firstSemester = firstSemester;
    }

    public Semester getSecondSemester() {
        return secondSemester;
    }

    public void setSecondSemester(Semester secondSemester) {
        this.secondSemester = secondSemester;
    }

    public Semester getSummerSemester() {
        return summerSemester;
    }

    public void setSummerSemester(Semester summerSemester) {
        this.summerSemester = summerSemester;
    }
}
