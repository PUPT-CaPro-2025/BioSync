package com.example.biosyncapi.suffix;

import java.util.List;
import java.util.Optional;

public interface SuffixService {
    List<Suffix> getSuffixes();
    Optional<Suffix> getSuffixById(Long id);
    Suffix createSuffix(Suffix suffix);
    Suffix updateSuffix(Suffix suffix);
    void deleteSuffix(Long id);
}
