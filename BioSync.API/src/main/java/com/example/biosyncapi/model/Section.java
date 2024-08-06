package com.example.biosyncapi.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Section {

    @Id
    private Long id;

    @ManyToOne
    @JoinColumn(name="program_id", nullable=false)
    private Program program;

    private String section;

    private String description;

    public Section() {
    }

    public Section(Long id, Program program, String section, String description) {
        this.id = id;
        this.program = program;
        this.section = section;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
