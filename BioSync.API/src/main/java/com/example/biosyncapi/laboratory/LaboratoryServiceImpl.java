package com.example.biosyncapi.laboratory;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LaboratoryServiceImpl implements LaboratoryService {

  private final LaboratoryRepository laboratoryRepository;

  public LaboratoryServiceImpl(LaboratoryRepository laboratoryRepository) {
    this.laboratoryRepository = laboratoryRepository;
  }

  @Override
  public List<Laboratory> getAllLaboratories() {
    return laboratoryRepository.findAll();
  }

  @Override
  public Optional<Laboratory> getLaboratoryById(Long id) {
    return laboratoryRepository.findById(id);
  }

  @Override
  public Laboratory createLaboratory(Laboratory laboratory) {
    return laboratoryRepository.save(laboratory);
  }

  @Override
  public Laboratory updateLaboratory(Laboratory laboratory) {
    return laboratoryRepository.save(laboratory);
  }

  @Override
  public void deleteLaboratory(Long id) {
    laboratoryRepository.deleteById(id);
  }
}
