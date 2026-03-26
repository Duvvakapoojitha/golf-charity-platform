package com.golf.controller;

import com.golf.dto.ApiResponse;
import com.golf.dto.CharityRequest;
import com.golf.model.Charity;
import com.golf.service.CharityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/charities")
@RequiredArgsConstructor
public class CharityController {

    private final CharityService charityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Charity>>> getAll(@RequestParam(required = false) String search) {
        List<Charity> charities = search != null ? charityService.search(search) : charityService.getAllActive();
        return ResponseEntity.ok(ApiResponse.success(charities));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Charity>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(charityService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Charity>> create(@Valid @RequestBody CharityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Charity created", charityService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Charity>> update(@PathVariable UUID id,
                                                        @Valid @RequestBody CharityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Charity updated", charityService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        charityService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Charity deleted", null));
    }
}
