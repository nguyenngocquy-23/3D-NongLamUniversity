package vn.edu.hcmuaf.virtualnluapi.scheduler;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

@DisallowConcurrentExecution
public class GCJob implements Job {
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        System.out.println("Running GC job at: " + java.time.LocalDateTime.now());
        System.gc();
    }
}
