package com.example.biosyncapi.semester;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/semester")
public class SemesterController {

  private final SemesterService semesterService;

  public SemesterController(SemesterService semesterService) {
    this.semesterService = semesterService;
  }

  @GetMapping
  public List<Semester> getAllSemesters() {
    return semesterService.getAllSemesters();
  }

  @GetMapping("/{id}")
  public Optional<Semester> getSemesterById(@PathVariable Long id) {
    return semesterService.getSemesterById(id);
  }

  @PostMapping
  public Semester createSemester(@RequestBody Semester semester) {
    return semesterService.createSemester(semester);
  }

  @PutMapping
  public Semester updateSemester(@RequestBody Semester semester) {
    return semesterService.updateSemester(semester);
  }

  @DeleteMapping
  public void deleteSemester(@RequestBody Semester semester) {
    semesterService.deleteSemester(semester.getId());
  }
}
