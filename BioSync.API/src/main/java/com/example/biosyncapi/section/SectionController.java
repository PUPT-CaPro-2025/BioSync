package com.example.biosyncapi.section;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/sections")
public class SectionController {

  private final SectionService sectionService;

  public SectionController(SectionService sectionService) {
    this.sectionService = sectionService;
  }

  @GetMapping
  public List<Section> getAllSections() {
    return sectionService.getAllSections();
  }

  @GetMapping("/{id}")
  public Optional<Section> getSectionById(@PathVariable Long id) {
    return sectionService.getSectionById(id);
  }

  @PostMapping
  public Section createSection(@RequestBody Section section) {
    return sectionService.saveSection(section);
  }

  @PutMapping
  public Section updateSection(@RequestBody Section section) {
    return sectionService.updateSection(section);
  }

  @DeleteMapping
  public void deleteSectionById(@RequestBody Section section) {
    sectionService.deleteSection(section.getId());
  }
}
