package vn.edu.hcmuaf.virtualnluapi.config;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.Map;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<RuntimeException> {
    @Override
    public Response toResponse(RuntimeException ex) {
        System.out.println("🔥 GlobalExceptionMapper hoạt động: " + ex.getMessage());
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", ex.getMessage()))
                .build();
    }
}