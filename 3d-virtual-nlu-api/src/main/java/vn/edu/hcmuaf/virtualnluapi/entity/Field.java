package vn.edu.hcmuaf.virtualnluapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Field {
    private int id;
    private String name;
    private LocalDateTime createdAt, updatedAt;
}
