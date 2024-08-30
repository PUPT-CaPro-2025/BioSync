package com.example.biosyncapi.service.impl;

import com.example.biosyncapi.model.Visitor;
import com.example.biosyncapi.repository.VisitorRepository;
import com.example.biosyncapi.service.VisitorService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VisitorServiceImpl implements VisitorService {

    private final VisitorRepository visitorRepository;

    public VisitorServiceImpl(VisitorRepository visitorRepository) {
        this.visitorRepository = visitorRepository;
    }

    @Override
    public List<Visitor> getVisitors() {
        return visitorRepository.findAll();
    }

    @Override
    public Optional<Visitor> getVisitorById(Long id) {
        return visitorRepository.findById(id);
    }

    @Override
    public Visitor createVisitor(Visitor visitor) {
        return visitorRepository.save(visitor);
    }

    @Override
    public Visitor updateVisitor(Visitor visitor) {
        return visitorRepository.save(visitor);
    }

    @Override
    public void deleteVisitor(Long id) {
        visitorRepository.deleteById(id);
    }
}
