package com.example.biosyncapi.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="visitors")
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String purposeOfVisit;

    private String otherDetails;

    private String destination;

    private LocalDateTime visitDate;

    @PrePersist
    protected void onCreate() {
        visitDate = LocalDateTime.now();
    }

    public Visitor() {
    }

    public Visitor(Long id, String name, String purposeOfVisit, String otherDetails, String destination, LocalDateTime visitDate) {
        this.id = id;
        this.name = name;
        this.purposeOfVisit = purposeOfVisit;
        this.otherDetails = otherDetails;
        this.destination = destination;
        this.visitDate = visitDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPurposeOfVisit() {
        return purposeOfVisit;
    }

    public void setPurposeOfVisit(String purposeOfVisit) {
        this.purposeOfVisit = purposeOfVisit;
    }

    public String getOtherDetails() {
        return otherDetails;
    }

    public void setOtherDetails(String otherDetails) {
        this.otherDetails = otherDetails;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDateTime getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDateTime visitDate) {
        this.visitDate = visitDate;
    }
}
