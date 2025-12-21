package vn.edu.hcmuaf.virtualnluapi.connection;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class AppShutdownListener implements ServletContextListener {

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        HikariCP.shutdown();
        System.out.println("✅ HikariCP shutdown");
    }
}
