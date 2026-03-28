package infosys.project.farmchainxai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (required for sending cookies/auth tokens)
        config.setAllowCredentials(true);
        
        // Define allowed origins (update these based on your environment)
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:8000",
                "http://127.0.0.1:*"
        ));
        
        // Allow all HTTP methods
        config.addAllowedMethod("*");
        
        // Allow common headers for JWT and content-type
        config.addAllowedHeader("*");
        
        // Expose headers that client might need
        config.addExposedHeader("Authorization");
        config.addExposedHeader("X-Total-Count");
        
        // Cache preflight requests for 1 hour
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
