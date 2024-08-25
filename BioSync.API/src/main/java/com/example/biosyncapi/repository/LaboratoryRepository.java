package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Laboratory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaboratoryRepository extends JpaRepository<Laboratory, Long> {
}
