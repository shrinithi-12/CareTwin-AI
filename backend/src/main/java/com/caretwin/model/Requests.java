package com.caretwin.model;

public final class Requests {
  public record Login(String username, String password) {}
  public record Patient(String name, String dob, String gender, String phone, String email, String address) {}
  public record Visit(Integer patientId, String visitDate, String diagnosis, String medicine, String notes, String followUpDate, String aiStateJson, boolean aiVerified) {}
  public record ThreadRequest(Integer patientId, Integer sourceVisitId, String expectedDate, String type, String sourceText) {}
}
