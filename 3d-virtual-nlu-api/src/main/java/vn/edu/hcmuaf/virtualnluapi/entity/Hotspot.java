package vn.edu.hcmuaf.virtualnluapi.entity;

import java.time.LocalDateTime;

/**
 *  positionX, Y, Z : vị trí toạ độ của Hotspot.
 *  type: Kiểu hotspot.
 *  pitch, yaw, roll: rotation.x, .y,.z hướng xoay của hotspot
 * nodeId: Mỗi hotspot sẽ nằm trong 1 không gian
 * status: trạng thái hotspot: 1 - hiển thị, 0 - ẩn, 2 - bị xoá.
 * size: Kích thước scale của hotspot khi hiển thị.
 */

public class Hotspot {
    int id;
    double positionX, positionY, positionZ;
    HotspotType type;
    double pitch, yaw, roll;
    LocalDateTime createdAt, updatedAt;
    int nodeId;
    int status;
    float size;
}
