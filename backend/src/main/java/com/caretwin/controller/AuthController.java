package com.caretwin.controller;

import com.caretwin.model.Requests.Login;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager auth;
    private final SecurityContextRepository repo;
    public AuthController(AuthenticationManager auth, SecurityContextRepository repo){this.auth=auth;this.repo=repo;}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Login body, HttpServletRequest request, HttpServletResponse response) {
        try {
            Authentication a = auth.authenticate(new UsernamePasswordAuthenticationToken(body.username(), body.password()));
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(a); SecurityContextHolder.setContext(context); repo.saveContext(context, request, response);
            return ResponseEntity.ok(Map.of("authenticated", true, "username", a.getName(), "role", a.getAuthorities().iterator().next().getAuthority()));
        } catch (Exception e) { return ResponseEntity.status(401).body(Map.of("message", "Invalid staff ID or password")); }
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(Authentication a) {
        if (a == null || !a.isAuthenticated() || a instanceof AnonymousAuthenticationToken) return ResponseEntity.status(401).body(Map.of("authenticated", false));
        return ResponseEntity.ok(Map.of("authenticated", true, "username", a.getName(), "role", a.getAuthorities().iterator().next().getAuthority()));
    }

    @PostMapping("/logout")
    public Map<String,Object> logout(HttpServletRequest request) throws Exception {
        request.getSession(false); if(request.getSession(false)!=null) request.getSession(false).invalidate(); SecurityContextHolder.clearContext();
        return Map.of("authenticated", false);
    }
}
