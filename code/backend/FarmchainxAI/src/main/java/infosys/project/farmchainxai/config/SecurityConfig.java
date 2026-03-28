package infosys.project.farmchainxai.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager is auto-configured by Spring Boot based on:
    // 1. UserDetailsService bean (CustomUserDetailsService)
    // 2. PasswordEncoder bean (BCryptPasswordEncoder)
    // No manual configuration needed in Spring Security 6.0+

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Auth endpoints - permit all (registration, login, password reset, etc.)
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        
                        // Health check endpoints
                        .requestMatchers("/health").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        
                        // QR code traceability endpoint - public access (no authentication)
                        // Includes batch details, reviews (GET and POST)
                        .requestMatchers("/api/v1/browse/batches/**").permitAll()
                        
                        // Supply chain verification - public access for QR scanner consumers
                        // Allows consumers to view supply chain journey without login
                        .requestMatchers("/api/v1/supply-chain/batch/*/verified").permitAll()
                        .requestMatchers("/api/v1/supply-chain/batch/*/timeline").permitAll()
                        .requestMatchers("/api/v1/supply-chain/batch/*/hash-chain").permitAll()
                        
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(401);
                            response.getWriter().write("{\"message\":\"Unauthorized\",\"success\":false}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json");
                            response.setStatus(403);
                            response.getWriter().write("{\"message\":\"Access Denied\",\"success\":false}");
                        })
                );

        return http.build();
    }
}
