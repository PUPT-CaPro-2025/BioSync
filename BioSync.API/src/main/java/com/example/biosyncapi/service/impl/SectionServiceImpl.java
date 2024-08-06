package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Section;
import com.example.biosyncapi.repository.SectionRepository;
import com.example.biosyncapi.service.SectionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SectionServiceImpl implements SectionService {

    private final SectionRepository sectionRepository;

    public SectionServiceImpl(SectionRepository sectionRepository) {
        this.sectionRepository = sectionRepository;
    }

    @Override
    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    @Override
    public Optional<Section> getSectionById(long id) {
        return sectionRepository.findById(id);
    }

    @Override
    public Section saveSection(Section section) {
        return sectionRepository.save(section);
    }

    @Override
    public Section updateSection(Section section) {
        return sectionRepository.save(section);
    }

    @Override
    public void deleteSection(long id) {
        sectionRepository.deleteById(id);
    }
}
