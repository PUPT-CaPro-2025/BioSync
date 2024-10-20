package com.example.biosyncapi.section;

import java.util.List;
import java.util.Optional;

public interface SectionService {
  List<Section> getAllSections();

  Optional<Section> getSectionById(long id);

  Section saveSection(Section section);

  Section updateSection(Section section);

  void deleteSection(long id);
}
