package com.example.biosyncapi.laboratory;

import java.util.List;
import java.util.Optional;

public interface LaboratoryService {
    List<Laboratory> getAllLaboratories();
    Optional<Laboratory> getLaboratoryById(Long id);
    Laboratory createLaboratory(Laboratory laboratory);
    Laboratory updateLaboratory(Laboratory laboratory);
    void deleteLaboratory(Long id);
}
