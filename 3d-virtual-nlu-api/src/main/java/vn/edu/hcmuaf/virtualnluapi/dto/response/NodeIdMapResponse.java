package vn.edu.hcmuaf.virtualnluapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NodeIdMapResponse {
    /**
     * Trong NodeCreateRequest: có 2 trường id và tempId.
     * tempId: Sử dụng nanoId để tạo id tạm trên redux.
     * realId: id thực sự được lưu trong database. (id tự tăng).
     */
    String tempId;
    int realId;
}
