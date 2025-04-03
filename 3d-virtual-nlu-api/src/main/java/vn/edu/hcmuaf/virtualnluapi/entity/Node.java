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
public class Node {
    private int id, spaceId;
    private String url, name, description;
    private LocalDateTime createdAt, updatedAt;
}
