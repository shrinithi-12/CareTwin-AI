package com.caretwin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(JdbcTemplate db) {
        return username -> db.queryForObject(
                "SELECT username,password,role,enabled FROM users WHERE username=?",
                (rs, rowNum) -> User.withUsername(rs.getString("username"))
                        .password(rs.getString("password"))
                        .roles(rs.getString("role"))
                        .disabled(rs.getInt("enabled") != 1)
                        .build(),
                username
        );
    }

    @Bean
    DaoAuthenticationProvider authenticationProvider(
            UserDetailsService uds,
            PasswordEncoder encoder) {

        DaoAuthenticationProvider p =
                new DaoAuthenticationProvider(uds);

        p.setPasswordEncoder(encoder);

        return p;
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration c) throws Exception {

        return c.getAuthenticationManager();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .cors(c -> c.configurationSource(corsConfigurationSource()))

            .csrf(c -> c.disable())

            .authorizeHttpRequests(a -> a

                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/status",
                    "/api/auth/logout",
                    "/error"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/health"
                ).permitAll()

                .anyRequest().authenticated()
            )

            .formLogin(f -> f.disable())

            .httpBasic(b -> b.disable())

            .logout(l -> l.disable());

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration c = new CorsConfiguration();

        c.setAllowedOrigins(
                List.of(
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:5174",
                    "http://127.0.0.1:5174"
                )
        );

        c.setAllowedMethods(
                List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "OPTIONS"
                )
        );

        c.setAllowedHeaders(
                List.of("*")
        );

        c.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource s =
                new UrlBasedCorsConfigurationSource();

        s.registerCorsConfiguration(
                "/**",
                c
        );

        return s;
    }
}