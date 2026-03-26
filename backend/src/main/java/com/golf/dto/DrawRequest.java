package com.golf.dto;

import com.golf.model.Draw;
import lombok.Data;

@Data
public class DrawRequest {
    private Draw.DrawType drawType = Draw.DrawType.RANDOM;
}
