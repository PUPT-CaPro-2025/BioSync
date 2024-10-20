package com.example.biosyncapi.section;

import com.example.biosyncapi.program.Program;
import jakarta.persistence.*;

@Entity
public class Section {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "program_id", nullable = false)
  private Program program;

  private String year;

  private int section;

  public Section() {
  }

  public Section(
      Long id,
      Program program,
      String year,
      int section)
  {
    this.id = id;
    this.program = program;
    this.year = year;
    this.section = section;
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

  public String getYear() {
    return year;
  }

  public void setYear(String year) {
    this.year = year;
  }

  public int getSection() {
    return section;
  }

  public void setSection(int section) {
    this.section = section;
  }

}
