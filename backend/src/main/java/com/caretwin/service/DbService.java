package com.caretwin.service;

import com.caretwin.model.Requests;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DbService {
  private final JdbcTemplate db;
  public DbService(JdbcTemplate db){this.db=db;}
  public List<Map<String,Object>> patients(String q){String s=q==null?"":q.trim(); if(s.isEmpty()) return db.queryForList("SELECT * FROM patients ORDER BY id DESC"); String like="%"+s+"%"; return db.queryForList("SELECT * FROM patients WHERE name LIKE ? OR patient_code LIKE ? OR phone LIKE ? ORDER BY id DESC",like,like,like);}
  public Map<String,Object> patient(int id){Map<String,Object> p=db.queryForMap("SELECT * FROM patients WHERE id=?",id); p.put("visits", db.queryForList("SELECT * FROM visits WHERE patient_id=? ORDER BY visit_date DESC,id DESC",id)); return p;}
  public Map<String,Object> createPatient(Requests.Patient x,String user){String code="CT-"+String.format("%05d",(db.queryForObject("SELECT COALESCE(MAX(id),0)+1 FROM patients",Integer.class))); db.update("INSERT INTO patients(patient_code,name,dob,gender,phone,email,address,created_at) VALUES(?,?,?,?,?,?,?,?)",code,x.name(),x.dob(),x.gender(),x.phone(),x.email(),x.address(),LocalDateTime.now().toString()); int id=db.queryForObject("SELECT last_insert_rowid()",Integer.class); audit(user,"CREATE","PATIENT",id,"Registered "+code); return patient(id);}
  public Map<String,Object> createVisit(Requests.Visit x,String user){db.update("INSERT INTO visits(patient_id,visit_date,diagnosis,medicine,notes,ai_state_json,ai_verified,follow_up_date,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",x.patientId(),x.visitDate(),x.diagnosis(),x.medicine(),x.notes(),x.aiStateJson(),x.aiVerified()?1:0,x.followUpDate(),user,LocalDateTime.now().toString()); int id=db.queryForObject("SELECT last_insert_rowid()",Integer.class); audit(user,"CREATE","VISIT",id,"Patient "+x.patientId()); return db.queryForMap("SELECT * FROM visits WHERE id=?",id);}
  public Map<String,Object> createThread(Requests.ThreadRequest x,String user){db.update("INSERT INTO care_threads(patient_id,source_visit_id,expected_date,type,status,source_text,created_at) VALUES(?,?,?,?,?,?,?)",x.patientId(),x.sourceVisitId(),x.expectedDate(),x.type(),"PENDING",x.sourceText(),LocalDateTime.now().toString()); int id=db.queryForObject("SELECT last_insert_rowid()",Integer.class); audit(user,"CREATE","CARE_THREAD",id,"Pending follow-up"); return db.queryForMap("SELECT * FROM care_threads WHERE id=?",id);}
  public List<Map<String,Object>> threads(){return db.queryForList("SELECT t.*,p.name patient_name,p.patient_code FROM care_threads t JOIN patients p ON p.id=t.patient_id ORDER BY t.id DESC");}
  public Map<String,Object> stats(){Integer p=db.queryForObject("SELECT COUNT(*) FROM patients",Integer.class); Integer v=db.queryForObject("SELECT COUNT(*) FROM visits WHERE visit_date=date('now')",Integer.class); Integer t=db.queryForObject("SELECT COUNT(*) FROM care_threads WHERE status='PENDING'",Integer.class); return Map.of("patients",p,"todayVisits",v,"pendingThreads",t,"recordBlindSpots",0);}
  public void audit(String user,String action,String type,Integer id,String details){db.update("INSERT INTO audit_logs(username,action,entity_type,entity_id,details,created_at) VALUES(?,?,?,?,?,?)",user,action,type,id,details,LocalDateTime.now().toString());}
}
