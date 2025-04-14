package vn.edu.hcmuaf.virtualnluapi;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

@ApplicationPath("/api")
public class ApiService extends Application {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}