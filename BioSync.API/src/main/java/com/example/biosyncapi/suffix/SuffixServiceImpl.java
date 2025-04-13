package com.example.biosyncapi.suffix;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SuffixServiceImpl implements SuffixService {

    private final SuffixRepository suffixRepository;

    public SuffixServiceImpl(SuffixRepository suffixRepository) {
        this.suffixRepository = suffixRepository;
    }

    @Override
    public List<Suffix> getSuffixes() {
        return suffixRepository.findAll();
    }

    @Override
    public Optional<Suffix> getSuffixById(Long id) {
        return suffixRepository.findById(id);
    }

    @Override
    public Suffix createSuffix(Suffix suffix) {
        return suffixRepository.save(suffix);
    }

    @Override
    public Suffix updateSuffix(Suffix suffix) {
        return suffixRepository.save(suffix);
    }

    @Override
    public void deleteSuffix(Long id) {
        suffixRepository.deleteById(id);
    }
}
