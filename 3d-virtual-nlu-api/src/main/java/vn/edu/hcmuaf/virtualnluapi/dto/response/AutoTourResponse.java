package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AutoTourResponse {
    int id;
    String name, thumbNail, indexNode, soundBackground;
    byte status;
    Timestamp updatedAt;
}
