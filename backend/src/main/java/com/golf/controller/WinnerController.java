package com.golf.controller;

import com.golf.dto.ApiResponse;
import com.golf.model.User;
import com.golf.model.Winner;
import com.golf.service.FileUploadService;
import com.golf.service.UserService;
import com.golf.service.WinnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/winners")
@RequiredArgsConstructor
public class WinnerController {

    private final WinnerService winnerService;
    private final UserService userService;
    private final FileUploadService fileUploadService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Winner>>> getMyWinnings(Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(winnerService.getUserWinnings(user)));
    }

    // Upload proof via URL (existing)
    @PostMapping("/{id}/proof")
    public ResponseEntity<ApiResponse<Winner>> uploadProofUrl(Principal principal,
                                                               @PathVariable UUID id,
                                                               @RequestBody Map<String, String> body) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Proof uploaded",
                winnerService.uploadProof(id, user, body.get("proofUrl"))));
    }

    // Upload proof via actual file (new — uses Cloudinary)
    @PostMapping(value = "/{id}/proof/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Winner>> uploadProofFile(Principal principal,
                                                                @PathVariable UUID id,
                                                                @RequestParam("file") MultipartFile file) {
        User user = userService.getByEmail(principal.getName());
        try {
            String url = fileUploadService.uploadFile(file, "winner-proofs");
            return ResponseEntity.ok(ApiResponse.success("Proof uploaded",
                    winnerService.uploadProof(id, user, url)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Winner>>> getPending() {
        return ResponseEntity.ok(ApiResponse.success(winnerService.getPendingVerification()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Winner>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(winnerService.getAllWinners()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Winner>> updateStatus(@PathVariable UUID id,
                                                             @RequestBody Map<String, String> body) {
        Winner.PaymentStatus status = Winner.PaymentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                winnerService.updatePaymentStatus(id, status, body.get("notes"))));
    }
}
