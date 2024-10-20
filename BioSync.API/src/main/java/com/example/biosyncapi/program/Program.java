package com.example.biosyncapi.program;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Program {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String programName;

  private String programAbbreviation;

  private String programDescription;

  public Program() {}

  public Program(
      Long id,
      String programName,
      String programAbbreviation,
      String programDescription)
  {
    this.id = id;
    this.programName = programName;
    this.programAbbreviation = programAbbreviation;
    this.programDescription = programDescription;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getProgramName() {
    return programName;
  }

  public void setProgramName(String programName) {
    this.programName = programName;
  }

  public String getProgramAbbreviation() {
    return programAbbreviation;
  }

  public void setProgramAbbreviation(String programAbbreviation) {
    this.programAbbreviation = programAbbreviation;
  }

  public String getProgramDescription() {
    return programDescription;
  }

  public void setProgramDescription(String programDescription) {
    this.programDescription = programDescription;
  }
}
