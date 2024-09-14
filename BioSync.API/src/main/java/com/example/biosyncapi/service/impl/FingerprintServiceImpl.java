package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Fingerprint;
import com.example.biosyncapi.repository.FingerprintRepository;
import com.example.biosyncapi.service.FingerprintService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FingerprintServiceImpl implements FingerprintService {

    private final FingerprintRepository fingerprintRepository;

    public FingerprintServiceImpl(FingerprintRepository fingerprintRepository) {
        this.fingerprintRepository = fingerprintRepository;
    }

    @Override
    public List<Fingerprint> getAllBySectionId(Long sectionId) {
        return fingerprintRepository.getAllBySectionId(sectionId);
    }

}
