package com.golf.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CharityRequest {
    @NotBlank
    private String name;
    private String description;
    private String imageUrl;
    private String website;
    private String category;
    private Boolean isActive = true;
}
