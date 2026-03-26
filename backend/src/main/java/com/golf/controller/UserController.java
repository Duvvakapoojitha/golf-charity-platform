package com.golf.controller;

import com.golf.dto.ApiResponse;
import com.golf.dto.ParticipationSummaryDto;
import com.golf.model.User;
import com.golf.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getProfile(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(userService.getByEmail(principal.getName())));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(Principal principal,
                                                            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                userService.updateProfile(principal.getName(), updates)));
    }

    @GetMapping("/me/participation")
    public ResponseEntity<ApiResponse<ParticipationSummaryDto>> getParticipation(Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(userService.getParticipationSummary(user)));
    }
}
