# CareTwin AI — Patient Care Continuity System

## Project Description

CareTwin AI is an AI-assisted Patient Medical Record and Care Continuity System designed to help healthcare staff identify important continuity information from patient visit notes.

The system allows authorized staff to manage patient records, record clinical visits, and analyze visit notes to extract documented care-continuity signals such as:

- Patient complaints
- Medication-change mentions
- Follow-up intentions
- Recurring complaints
- Follow-up dates

The extracted information is presented as an **AI Care State** for human verification. Verified follow-up information can be converted into a **Future Care Thread**, connecting the current visit with the patient's next care step.

CareTwin AI is an assistive prototype. It does not diagnose diseases, prescribe medicines, or replace healthcare professionals.

---

## Problem Statement

Important care-continuity information can be buried inside individual patient visit notes.

Healthcare staff may need to manually review previous patient records to identify:

- Recurring complaints
- Medication changes
- Follow-up instructions
- Important information that needs to be continued in the next visit

This can make it difficult to quickly understand the patient's care continuity and identify the next documented care step.

---

## Existing Solution

Existing Electronic Health Record (EHR) systems store patient information, medical history, visit notes, medicines, reports, and other clinical information.

Some healthcare systems also provide features such as patient-history summaries and follow-up management.

However, continuity-related information may still be distributed across individual visit records and require manual review to connect information from one visit to the next.

---

## Proposed Solution

CareTwin AI adds a care-continuity layer to the patient record.

The system analyzes a clinical visit note and extracts documented continuity signals such as:

1. Patient complaints
2. Medication changes
3. Follow-up intentions
4. Recurring complaints

The extracted information is displayed as an **AI Care State**.

A healthcare staff member reviews and verifies the extracted information before it is accepted as part of the patient's record.

Documented follow-up intentions can then be represented as **Future Care Threads**, helping connect the current visit with the patient's next care step.

### Core Workflow

Patient Record  
↓  
Visit Note  
↓  
AI Analysis  
↓  
Care Continuity Signals  
↓  
Human Verification  
↓  
Verified Visit Record  
↓  
Future Care Thread

---

## Key Features

### 1. Authorized Staff Login

The system provides authenticated staff access using Spring Security and BCrypt-based password authentication.

### 2. Patient Management

Authorized staff can:

- Register patients
- Search patients
- View patient profiles
- View patient visit history

### 3. Visit Recording

Staff can add visit information and clinical notes to a patient's record.

### 4. AI Care State

The AI service extracts documented information from the visit note, including:

- Complaints
- Medication-change mentions
- Follow-up intention
- Recurrence signal
- Confidence
- Summary

### 5. Human Verification

AI-generated information is presented for human verification before being treated as verified care information.

### 6. Future Care Threads

A documented follow-up instruction such as:

> "Review after 7 days."

can be converted into a future follow-up thread associated with the patient's care journey.

### 7. Local Storage

The prototype uses SQLite for local application data storage.

### 8. Separate AI Service

The AI functionality is implemented as a separate Python FastAPI service.

This allows the AI component to be developed or improved independently from the main application.

---

## AI Approach

The current prototype uses a lightweight **rule-based NLP approach**.

It does not use a pretrained large language model or external generative AI API.

The Python AI service uses:

- Keyword matching
- Regular expressions
- Previous visit-note comparison
- Structured response generation

For example, from:

> "Patient reports recurring headache. Previous medicine was stopped due to discomfort. Review after 7 days."

the system can extract:

- Complaint: Headache
- Medication change: Mentioned
- Follow-up: 7 days
- Recurrence: Based on previous visit notes

The AI output is intended to assist healthcare staff and requires human verification.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Java
- Spring Boot
- Spring Security
- Maven

### Database

- SQLite

### AI Service

- Python
- FastAPI
- Pydantic
- Regular Expressions
- Rule-based NLP

---

## System Architecture

```text
                 ┌─────────────────────┐
                 │      React UI       │
                 │     Frontend        │
                 │      :5174          │
                 └──────────┬──────────┘
                            │
                            │ HTTP API
                            ▼
                 ┌─────────────────────┐
                 │   Spring Boot       │
                 │      Backend        │
                 │       :8080         │
                 └───────┬─────┬───────┘
                         │     │
                  ┌──────┘     └──────────────┐
                  ▼                           ▼
          ┌──────────────┐             ┌──────────────┐
          │    SQLite    │             │  FastAPI AI  │
          │   Database   │             │   Service    │
          └──────────────┘             │    :8000     │
                                       └──────────────┘
