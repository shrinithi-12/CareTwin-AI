package com.caretwin.controller;
import com.caretwin.model.Requests.Visit; import com.caretwin.service.DbService; import org.springframework.web.bind.annotation.*; import org.springframework.security.core.Authentication; import java.util.*;
@RestController @RequestMapping("/api/visits") public class VisitController {private final DbService db; public VisitController(DbService db){this.db=db;} @PostMapping public Map<String,Object> create(@RequestBody Visit v,Authentication a){return db.createVisit(v,a.getName());}}
