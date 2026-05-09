package com.zonnecto.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Absolute path — Windows/Linux dono pe kaam karta hai
        // Paths.get() OS-specific separator handle karta hai
        // toUri() se proper file:/// URL banta hai
        String uploadPath = Paths.get(System.getProperty("user.dir"), "uploads")
                .toUri()
                .toString();

        // Ensure trailing slash
        if (!uploadPath.endsWith("/")) {
            uploadPath = uploadPath + "/";
        }

        // GET /api/uploads/dp/filename.jpg → <project-root>/uploads/dp/filename.jpg
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(0); // Dev mein cache mat karo
    }
}