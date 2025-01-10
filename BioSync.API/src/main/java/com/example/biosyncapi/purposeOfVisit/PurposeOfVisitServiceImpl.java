package com.example.biosyncapi.purposeOfVisit;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PurposeOfVisitServiceImpl implements PurposeOfVisitService {

    private final PurposeOfVisitRepository purposeOfVisitRepository;

    public PurposeOfVisitServiceImpl(PurposeOfVisitRepository purposeOfVisitRepository) {
        this.purposeOfVisitRepository = purposeOfVisitRepository;
    }

    @Override
    public List<PurposeOfVisit> getPurposeOfVisit() {
        return purposeOfVisitRepository.findAll();
    }

    @Override
    public PurposeOfVisit addPurposeOfVisit(PurposeOfVisit pv) {
        return purposeOfVisitRepository.save(pv);
    }

    @Override
    public PurposeOfVisit updatePurposeOfVisit(PurposeOfVisit pv) {
        return purposeOfVisitRepository.save(pv);
    }

    @Override
    public void deletePurposeOfVisitById(Long id) {
        purposeOfVisitRepository.deleteById(id);
    }
}
