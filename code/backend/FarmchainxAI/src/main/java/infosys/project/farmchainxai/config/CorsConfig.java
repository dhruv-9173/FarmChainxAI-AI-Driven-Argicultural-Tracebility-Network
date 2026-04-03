package infosys.project.farmchainxai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origin-patterns:farm-chainx-ai-ai-driven-argicultur-rho.vercel.app}")
    private String allowedOriginPatterns;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (required for sending cookies/auth tokens)
        config.setAllowCredentials(true);
        
        // Define allowed origin patterns from configuration
        List<String> originPatterns = Arrays.stream(allowedOriginPatterns.split(","))
            .map(String::trim)
            .filter(pattern -> !pattern.isEmpty())
            .toList();
        config.setAllowedOriginPatterns(originPatterns);
        
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
