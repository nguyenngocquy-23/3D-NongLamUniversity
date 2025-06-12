package vn.edu.hcmuaf.virtualnluapi.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebFilter("/*") // Áp dụng cho tất cả API
public class CorsFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse res = (HttpServletResponse) response;
        HttpServletRequest req = (HttpServletRequest) request;

        String origin = req.getHeader("Origin");
        if (origin != null && !origin.isEmpty()) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            res.setHeader("Access-Control-Allow-Origin", "*"); // fallback an toàn (trừ khi có credentials)
        }
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", "false");

        // Xử lý request OPTIONS (preflight request)
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        String upgrade = req.getHeader("Upgrade");
        if (upgrade != null && "websocket".equalsIgnoreCase(upgrade)) {
            chain.doFilter(request, response); // Bỏ qua CORS với WebSocket
            return;
        }
        try{
            chain.doFilter(request, response);
        } catch (Exception e) {
            e.printStackTrace();
            res.setContentType("text/plain;charset=UTF-8");
            res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            res.getWriter().write("Internal Server Error: " + e.getMessage());
        }
    }

    @Override
    public void destroy() {}
}
