package vn.edu.hcmuaf.virtualnluapi.connection;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.jdbi.v3.core.Jdbi;

import java.io.IOException;
import java.util.Properties;

public class HikariCP {

    private static HikariDataSource ds;
    private static Jdbi jdbi;
    private static final Properties properties = new Properties();

    static {
        try {
            Properties properties = new Properties();
            properties.load(
                    HikariCP.class.getClassLoader().getResourceAsStream("DB.properties")
            );

            String host = properties.getProperty("db.host");
            String port = properties.getProperty("db.port");
            String dbName = properties.getProperty("db.name");
            String username = properties.getProperty("db.username");
            String password = properties.getProperty("db.password");

            int minIdle = Integer.parseInt(properties.getProperty("db.initialPoolSize", "2"));
            int maxPool = Integer.parseInt(properties.getProperty("db.maxConnections", "10"));

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(
                    "jdbc:mysql://" + host + ":" + port + "/" + dbName +
                            "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
            );
            config.setUsername(username);
            config.setPassword(password);

            config.setMaximumPoolSize(maxPool);
            config.setMinimumIdle(minIdle);

            config.setConnectionTimeout(30000);
            config.setIdleTimeout(600000);
            config.setMaxLifetime(1800000);
            config.setLeakDetectionThreshold(10000);

            config.setMaxLifetime(25 * 60 * 1000);

            ds = new HikariDataSource(config);
            jdbi = Jdbi.create(ds);

        } catch (IOException e) {
            throw new RuntimeException("❌ Failed to load DB.properties", e);
        }
    }

    public static Jdbi getJdbi() {
        return jdbi;
    }

    public static void shutdown() {
        if (ds != null && !ds.isClosed()) {
            ds.close();
        }
    }
}
