package com.caretwin.controller;
import com.caretwin.model.Requests.Patient; import com.caretwin.service.DbService; import org.springframework.web.bind.annotation.*; import org.springframework.security.core.Authentication; import java.util.*;
@RestController @RequestMapping("/api/patients") public class PatientController { private final DbService db; public PatientController(DbService db){this.db=db;}
@GetMapping public List<Map<String,Object>> list(@RequestParam(name="q", defaultValue="") String q){return db.patients(q);} @GetMapping("/{id}") public Map<String,Object> one(@PathVariable("id") int id){return db.patient(id);} @PostMapping public Map<String,Object> create(@RequestBody Patient p,Authentication a){return db.createPatient(p,a.getName());}}
