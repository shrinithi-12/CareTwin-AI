package com.caretwin;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;

@SpringBootApplication
public class CareTwinApplication {
    public static void main(String[] args) { SpringApplication.run(CareTwinApplication.class, args); }

    @Bean
    CommandLineRunner seedStaff(JdbcTemplate db, PasswordEncoder encoder) {
        return args -> {
            Integer count = db.queryForObject("SELECT COUNT(*) FROM users WHERE username=?", Integer.class, "staff001");
            if (count == null || count == 0) {
                db.update("INSERT INTO users(username,password,role,enabled,created_at) VALUES(?,?,?,?,?)",
                        "staff001", encoder.encode("CareTwin@123"), "STAFF", 1, LocalDateTime.now().toString());
            }
        };
    }
}
