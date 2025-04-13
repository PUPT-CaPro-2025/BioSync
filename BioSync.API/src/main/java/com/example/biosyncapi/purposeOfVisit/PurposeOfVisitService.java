package com.example.biosyncapi.purposeOfVisit;

import java.util.List;

public interface PurposeOfVisitService {
    List<PurposeOfVisit> getPurposeOfVisit();
    PurposeOfVisit addPurposeOfVisit(PurposeOfVisit pv);
    PurposeOfVisit updatePurposeOfVisit(PurposeOfVisit pv);
    void deletePurposeOfVisitById(Long id);
}
