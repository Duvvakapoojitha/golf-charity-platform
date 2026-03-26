package com.golf.service;

import com.golf.dto.CharityRequest;
import com.golf.model.Charity;
import com.golf.repository.CharityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CharityService {

    private final CharityRepository charityRepository;

    public List<Charity> getAllActive() {
        return charityRepository.findByIsActiveTrue();
    }

    public List<Charity> getAll() {
        return charityRepository.findAll();
    }

    public Charity getById(UUID id) {
        return charityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Charity not found"));
    }

    public List<Charity> search(String query) {
        return charityRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query);
    }

    public Charity create(CharityRequest request) {
        Charity charity = Charity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .website(request.getWebsite())
                .category(request.getCategory())
                .isActive(request.getIsActive())
                .build();
        return charityRepository.save(charity);
    }

    public Charity update(UUID id, CharityRequest request) {
        Charity charity = getById(id);
        charity.setName(request.getName());
        charity.setDescription(request.getDescription());
        charity.setImageUrl(request.getImageUrl());
        charity.setWebsite(request.getWebsite());
        charity.setCategory(request.getCategory());
        charity.setIsActive(request.getIsActive());
        return charityRepository.save(charity);
    }

    public void delete(UUID id) {
        charityRepository.deleteById(id);
    }
}
