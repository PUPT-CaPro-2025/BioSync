package com.example.biosyncapi.service;

import com.example.biosyncapi.model.Fingerprint;

import java.util.List;

public interface FingerprintService {
    List<Fingerprint> getAllBySectionId(Long sectionId);
}
