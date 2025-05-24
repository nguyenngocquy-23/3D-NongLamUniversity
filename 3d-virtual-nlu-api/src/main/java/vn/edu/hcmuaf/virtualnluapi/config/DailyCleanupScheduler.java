package vn.edu.hcmuaf.virtualnluapi.config;

import jakarta.ejb.Schedule;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import vn.edu.hcmuaf.virtualnluapi.service.InvalidatedTokenService;

@Singleton
@Startup
public class DailyCleanupScheduler {

    @Inject
    private InvalidatedTokenService invalidatedTokenService;

    // Chạy mỗi ngày lúc 2h sáng
    @Schedule(hour = "0", minute = "0", second = "0", persistent = false)
    public void cleanInvalidTokens() {
        System.out.println("Đang xóa token vô hiệu...");
        boolean result = invalidatedTokenService.removeAll();
        System.out.println("Xóa invalidtoken kết thúc. Kết quả: " + result);
    }
}
