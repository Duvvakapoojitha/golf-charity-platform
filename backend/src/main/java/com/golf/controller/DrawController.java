package com.golf.controller;

import com.golf.dto.ApiResponse;
import com.golf.dto.DrawRequest;
import com.golf.model.Draw;
import com.golf.model.Winner;
import com.golf.service.DrawService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/draws")
@RequiredArgsConstructor
public class DrawController {

    private final DrawService drawService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Draw>>> getAllDraws() {
        return ResponseEntity.ok(ApiResponse.success(drawService.getAllDraws()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Draw>> getDraw(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(drawService.getById(id)));
    }

    @GetMapping("/{id}/winners")
    public ResponseEntity<ApiResponse<List<Winner>>> getWinners(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(drawService.getDrawWinners(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Draw>> createDraw(@RequestBody DrawRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Draw created", drawService.createDraw(request)));
    }

    @PostMapping("/{id}/simulate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Draw>> simulate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Draw simulated", drawService.simulateDraw(id)));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Draw>> publish(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Draw published", drawService.publishDraw(id)));
    }
}
