package vn.edu.hcmuaf.virtualnluapi.connection;

import org.jdbi.v3.core.Handle;

import java.sql.SQLException;

public class Connection {
    private Handle handle;

    public Connection(Handle handle) {
        this.handle = handle;
    }

    public <T> T withHandle(HandleCallback<T> callback) {
        try {
            var result = callback.execute(handle);
            return result;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        } finally {
            ConnectionPool.releaseConnection(this);
        }
    }

    public <T> T inTransaction(HandleCallback<T> callback) {
        try {
            handle.getConnection().setAutoCommit(false);
            var result = callback.execute(handle);
            handle.getConnection().commit();
            return result;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            try {
                handle.getConnection().rollback();
            } catch (SQLException ex) {
                throw new RuntimeException(ex);
            }
            return null;
        } finally {
            try {
                handle.getConnection().setAutoCommit(true);
            } catch (SQLException ex) {
                throw new RuntimeException(ex);
            }
            ConnectionPool.releaseConnection(this);
        }
    }

}

