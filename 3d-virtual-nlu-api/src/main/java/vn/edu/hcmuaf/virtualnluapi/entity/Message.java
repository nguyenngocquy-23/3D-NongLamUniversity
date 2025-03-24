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
public class Message {
    private int id, userId, roomId;
    private String content;
    private Timestamp createdAt;

}
