package com.example.biosyncapi.controller;

import com.example.biosyncapi.model.Laboratory;
import com.example.biosyncapi.service.LaboratoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/laboratories")
public class LaboratoryController {
    private final LaboratoryService laboratoryService;

    public LaboratoryController(LaboratoryService laboratoryService) {
        this.laboratoryService = laboratoryService;
    }

    @GetMapping
    public List<Laboratory> getAllLaboratories() {
        return laboratoryService.getAllLaboratories();
    }

    @GetMapping("/{id}")
    public Optional<Laboratory> getLaboratoryById(@PathVariable Long id) {
        return laboratoryService.getLaboratoryById(id);
    }

    @PostMapping
    public Laboratory createLaboratory(@RequestBody Laboratory laboratory) {
        return laboratoryService.createLaboratory(laboratory);
    }

    @PutMapping
    public Laboratory updateLaboratory(@RequestBody Laboratory laboratory) {
        return laboratoryService.updateLaboratory(laboratory);
    }

    @DeleteMapping
    public void deleteLaboratoryById(@RequestBody Laboratory laboratory) {
        laboratoryService.deleteLaboratory(laboratory.getId());
    }
}
