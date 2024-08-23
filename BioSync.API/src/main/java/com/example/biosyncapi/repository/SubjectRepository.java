package com.example.biosyncapi.repository;

import com.example.biosyncapi.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}
