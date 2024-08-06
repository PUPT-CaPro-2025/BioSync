package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Section;
import com.example.biosyncapi.service.SectionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("api/v1/section")
public class SectionController {

    private final SectionService sectionService;

    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }

    @GetMapping
    public List<Section> getAllSections() {
        return sectionService.getAllSections();
    }

    @GetMapping
    public Optional<Section> getSectionById(@RequestParam("id") Long id) {
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
