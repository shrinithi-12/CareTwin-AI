package com.caretwin.controller;
import com.caretwin.service.DbService; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/dashboard") public class DashboardController {private final DbService db; public DashboardController(DbService db){this.db=db;} @GetMapping("/stats") public Map<String,Object> stats(){return db.stats();} @GetMapping("/threads") public List<Map<String,Object>> threads(){return db.threads();}}
