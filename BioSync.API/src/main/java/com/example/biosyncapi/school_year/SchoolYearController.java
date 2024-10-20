package com.example.biosyncapi.school_year;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/school-year")
public class SchoolYearController {

  private final SchoolYearService schoolYearService;

  public SchoolYearController(SchoolYearService schoolYearService) {
    this.schoolYearService = schoolYearService;
  }

  @GetMapping
  public List<SchoolYear> getAllSchoolYears() {
    return schoolYearService.getAllSchoolYears();
  }

  @GetMapping("/{id}")
  public Optional<SchoolYear> getSchoolYearById(@PathVariable Long id) {
    return schoolYearService.getSchoolYearById(id);
  }

  @PostMapping
  public SchoolYear createSchoolYear(@RequestBody SchoolYear schoolYear) {
    return schoolYearService.saveSchoolYear(schoolYear);
  }

  @PutMapping
  public SchoolYear updateSchoolYear(@RequestBody SchoolYear schoolYear)
      throws Exception
  {
    return schoolYearService.updateSchoolYear(schoolYear);
  }

  @DeleteMapping
  public void deleteSchoolYear(@RequestBody SchoolYear schoolYear) {
    schoolYearService.deleteSchoolYearById(schoolYear.getId());
  }
}
