package vn.edu.hcmuaf.virtualnluapi.scheduler;

import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

public class GCScheduler {
    public static void main(String[] args) throws Exception {
        // 1. Tạo job detail
        JobDetail job = JobBuilder.newJob(GCJob.class)
                .withIdentity("gcJob", "system")
                .build();

        // 2. Tạo trigger (chạy mỗi 1 giờ)
        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("gcTrigger", "system")
                .startNow()
                .withSchedule(
                        CronScheduleBuilder.cronSchedule("0 0 12 * * ?")
                )
                .build();

        // 3. Tạo scheduler
        Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
        scheduler.start();
        scheduler.scheduleJob(job, trigger);

        System.out.println("GC Scheduler started...");
    }
}
