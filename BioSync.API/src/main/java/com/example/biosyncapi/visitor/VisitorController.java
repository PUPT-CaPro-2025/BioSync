package com.example.biosyncapi.visitor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/visitors")
public class VisitorController {

    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @GetMapping
    public List<Visitor> getVisitors() {
        return visitorService.getVisitors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Visitor> getVisitorById(@PathVariable Long id) {
        Optional<Visitor> visitor = visitorService.getVisitorById(id);

        return visitor.map(value -> ResponseEntity.ok().body(value))
                .orElseGet(() -> ResponseEntity.status(404).body(null));
    }

    @PostMapping
    public Visitor createVisitor(@RequestBody Visitor visitor) {
        return visitorService.createVisitor(visitor);
    }

    @PostMapping("/bulk-add")
    public ResponseEntity<Map<String, Object>> updateStudents(
        @RequestParam("file") MultipartFile file)
    {
        try {
            int visitorsLogged = this.visitorService.addBulkVisitorsCSV(file);

            return ResponseEntity.ok().body(Map.ofEntries(
                Map.entry("success", true),
                Map.entry("count", visitorsLogged)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.ofEntries(
                Map.entry("success", false),
                Map.entry("error", e.getMessage())));
        }
    }

    @PutMapping
    public Visitor updateVisitor(@RequestBody Visitor visitor) {
        return visitorService.updateVisitor(visitor);
    }

    @DeleteMapping
    public void deleteVisitorById(@RequestBody Visitor visitor) {
        visitorService.deleteVisitor(visitor.getId());
    }

}
