package com.example.biosyncapi.purposeOfVisit;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/visit-purposes")
public class PurposeOfVisitController {

    private final PurposeOfVisitService purposeOfVisitService;

    public PurposeOfVisitController(PurposeOfVisitService purposeOfVisitService) {
        this.purposeOfVisitService = purposeOfVisitService;
    }

    @GetMapping
    public List<PurposeOfVisit> getPurposeOfVisit() {
        return purposeOfVisitService.getPurposeOfVisit();
    }

    @PostMapping
    public PurposeOfVisit createPurposeOfVisit(@RequestBody PurposeOfVisit purposeOfVisit) {
        return purposeOfVisitService.addPurposeOfVisit(purposeOfVisit);
    }

    @PutMapping
    public PurposeOfVisit updatePurposeOfVisit(@RequestBody PurposeOfVisit purposeOfVisit) {
        return purposeOfVisitService.updatePurposeOfVisit(purposeOfVisit);
    }

    @DeleteMapping
    public void deletePurposeOfVisit(@RequestBody PurposeOfVisit purposeOfVisit) {
        purposeOfVisitService.deletePurposeOfVisitById(purposeOfVisit.getId());
    }
}
