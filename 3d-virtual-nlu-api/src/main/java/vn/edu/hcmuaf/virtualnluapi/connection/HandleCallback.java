package vn.edu.hcmuaf.virtualnluapi.connection;

import org.jdbi.v3.core.Handle;

@FunctionalInterface
public interface HandleCallback<T> {
    T execute(Handle handle) throws Exception;
}