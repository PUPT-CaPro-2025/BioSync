package com.example.biosyncapi.suffix;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/suffixes")
public class SuffixController {

    private final SuffixService suffixService;

    public SuffixController(SuffixService suffixService) {
        this.suffixService = suffixService;
    }

    @GetMapping
    public List<Suffix> getSuffixes() {
        return suffixService.getSuffixes();
    }

    @GetMapping("/{id}")
    public Optional<Suffix> getSuffix(@PathVariable Long id) {
        return suffixService.getSuffixById(id);
    }

    @PostMapping
    public Suffix createSuffix(@RequestBody Suffix suffix) {
        return suffixService.createSuffix(suffix);
    }

    @PutMapping
    public Suffix updateSuffix(@RequestBody Suffix suffix) {
        return suffixService.updateSuffix(suffix);
    }

    @DeleteMapping
    public void deleteSuffix(@RequestBody Suffix suffix) {
        suffixService.deleteSuffix(suffix.getId());
    }

}
