package vn.edu.hcmuaf.virtualnluapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    private int id;
    private String name;
    private Timestamp createdAt;

}
