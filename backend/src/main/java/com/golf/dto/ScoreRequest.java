package com.golf.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ScoreRequest {
    @NotNull
    @Min(1)
    @Max(45)
    private Integer score;

    @NotNull
    private LocalDate scoreDate;
}
