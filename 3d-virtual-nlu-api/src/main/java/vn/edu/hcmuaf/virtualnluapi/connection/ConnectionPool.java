package vn.edu.hcmuaf.virtualnluapi.connection;

import org.jdbi.v3.core.Jdbi;

import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class ConnectionPool {
    private static final Properties properties = new Properties();

    static {
        try {
            properties.load(ConnectionPool.class.getClassLoader().getResourceAsStream("DB.properties"));
        } catch (IOException e) {
            throw new RuntimeException("Failed to load database properties", e);
        }
    }

    private static final String HOST = properties.getProperty("db.host");
    private static final String PORT = properties.getProperty("db.port");
    private static final String USERNAME = properties.getProperty("db.username");
    private static final String PASSWORD = properties.getProperty("db.password");
    private static final String DB_NAME = properties.getProperty("db.name");
    private static final int INITIAL_POOL_SIZE = Integer.parseInt(properties.getProperty("db.initialPoolSize"));
    private static final int MAX_CONNECTIONS = Integer.parseInt(properties.getProperty("db.maxConnections"));

    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final ArrayBlockingQueue<Connection> pool;
    private static ConnectionPool instance;

    private ConnectionPool() {
        pool = new ArrayBlockingQueue<>(MAX_CONNECTIONS);
        for (int i = 0; i < INITIAL_POOL_SIZE; i++) {
            pool.add(createConnection());
        }
    }

    private static Connection createConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://" + HOST + ":" + PORT + "/" + DB_NAME;
            return new Connection(Jdbi.create(url, USERNAME, PASSWORD).open());
        } catch (Exception e) {
            throw new RuntimeException("Error creating a new database connection", e);
        }
    }

    public static synchronized Connection getConnection() {
        if (instance == null) {
            instance = new ConnectionPool();
        }
        try {
            if (instance.pool.isEmpty() && instance.activeConnections.get() < MAX_CONNECTIONS) {
                instance.activeConnections.incrementAndGet();
                return createConnection();
            }
            Connection connection = instance.pool.take();
            instance.activeConnections.incrementAndGet();
            return connection;
        } catch (InterruptedException e) {
            throw new RuntimeException("Failed to get a database connection", e);
        }
    }

    public static synchronized void releaseConnection(Connection connection) {
        if (connection != null) {
            instance.activeConnections.decrementAndGet();
            instance.pool.offer(connection);
        }
    }

    @Override
    public String toString() {
        return "Max=" + MAX_CONNECTIONS + " | Available=" + pool.size() + " | Busy=" + activeConnections.get();
    }
}
