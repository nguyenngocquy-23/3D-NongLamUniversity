package vn.edu.hcmuaf.virtualnluapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailVerification {
    private int id;
    private long userId;
    private String token;
    private Timestamp expiredAt;

}
