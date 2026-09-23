package com.caretwin.controller;
import org.springframework.http.*; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*; import org.springframework.web.client.RestClient; import java.util.*;
@RestController @RequestMapping("/api/ai") public class AiController {
  private final RestClient client=RestClient.builder().baseUrl("http://127.0.0.1:8000").build();
  @PostMapping("/analyze-visit") public ResponseEntity<?> analyze(@RequestBody Map<String,Object> body, Authentication a){
    try { Map<?,?> result=client.post().uri("/analyze-visit").contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(Map.class); return ResponseEntity.ok(result); }
    catch(Exception e){ return ResponseEntity.status(503).body(Map.of("message","AI service is unavailable. Start FastAPI on port 8000.")); }
  }
}
