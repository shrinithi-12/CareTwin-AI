# CareTwin AI — Patient Care Continuity System

## Project Description

CareTwin AI is an AI-assisted Patient Medical Record and Care Continuity System designed to help healthcare staff identify important continuity information from patient visit notes.

The system allows authorized staff to manage patient records, record clinical visits, and analyze visit notes to extract documented care-continuity signals such as:

- Patient complaints
- Medication-change mentions
- Follow-up intentions
- Recurring complaints
- Follow-up dates

The extracted information is presented as an AI Care State for human verification. Verified follow-up information can be converted into a Future Care Thread, connecting the current visit with the patient's next care step.

CareTwin AI is an assistive prototype. It does not diagnose diseases, prescribe medicines, or replace healthcare professionals.

---

## Problem Statement

Important care-continuity information can be buried inside individual patient visit notes.

Healthcare staff may need to manually review previous patient records to identify:

- Recurring complaints
- Medication changes
- Follow-up instructions
- Information that needs to be continued in the next visit

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

The extracted information is displayed as an AI Care State.

A healthcare staff member reviews and verifies the extracted information before it is accepted as part of the patient's record.

Documented follow-up intentions can then be represented as Future Care Threads, helping connect the current visit with the patient's next care step.

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

The current prototype uses a lightweight rule-based NLP approach.

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

The Spring Boot backend handles authentication, patient records, visits, database operations, and API access.

The FastAPI service performs the care-continuity text extraction.

Screenshots

The following screenshots show the developed application pages.

Login Page

Dashboard

Patient Registration

Patient Profile

Visit Entry

AI Care State

Visit History

Future Care Threads

Project Structure
CareTwin_AI_Secure_fixed_v2/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── ai-service/
│   ├── main.py
│   └── requirements.txt
│
├── screenshots/
│   ├── login.png
│   ├── dashboard.png
│   ├── patient-registration.png
│   ├── patient-profile.png
│   ├── visit-entry.png
│   ├── ai-care-state.png
│   ├── visit-history.png
│   └── future-care-threads.png
│
├── START_AI.cmd
├── START_BACKEND.cmd
├── START_FRONTEND.cmd
├── .gitignore
└── README.md
Setup and Run Instructions
Prerequisites

Install the following:

Java 21
Maven
Node.js
npm
Python 3.x
1. Start the AI Service

Open Command Prompt:

cd /d D:\CareTwin_AI_Secure_fixed_v2\ai-service

Create a virtual environment:

python -m venv .venv

Activate it:

.venv\Scripts\activate

Install the required packages:

pip install -r requirements.txt

Start the AI service:

python -m uvicorn main:app --port 8000

The AI service runs at:

http://127.0.0.1:8000
2. Start the Backend

Open another Command Prompt:

cd /d D:\CareTwin_AI_Secure_fixed_v2\backend

Run:

mvn spring-boot:run

The backend runs at:

http://localhost:8080
3. Start the Frontend

Open another Command Prompt:

cd /d D:\CareTwin_AI_Secure_fixed_v2\frontend

Install dependencies:

npm install

Start the frontend:

npm run dev -- --port 5174

Open the application at:

http://localhost:5174
Demo Login

For the local hackathon demonstration:

Staff ID: staff001
Password: CareTwin@123

These credentials are intended only for the local hackathon demonstration and should not be used for a production healthcare system.

Demo Flow
Login as authorized staff.
Register a patient.
Open the patient profile.
Add a visit.
Enter a clinical visit note.
Click Analyze with CareTwin AI.
Review the extracted AI Care State.
Verify the displayed information.
Save the visit.
Open Care Threads.
View the documented follow-up thread.
Example Visit Note
Patient reports recurring headache.
Previous medicine was stopped due to discomfort.
Review after 7 days.
Example Extracted Information
Complaint: headache

Medication change:
Medication change mentioned in the visit note

Follow-up:
Review/follow-up after 7 days

Follow-up date:
Generated from the documented 7-day follow-up period
Human Verification

CareTwin AI is designed as an assistive system.

The AI output is not automatically treated as a clinical decision.

The healthcare staff member reviews the extracted information before it becomes verified information in the patient record.

This approach keeps the healthcare professional in control of the final record.

Security

The prototype includes:

Authenticated staff access
Spring Security
BCrypt password hashing
Server-side session authentication
Protected patient APIs
Protected visit APIs
Authorized access to application data

This project is a local hackathon prototype and is not intended for production clinical deployment.

A production system would require additional security and compliance measures such as:

HTTPS
Secure secret management
Stronger session and cookie policies
Encryption at rest
Fine-grained role-based access control
Comprehensive audit logging
Rate limiting
Backup and recovery
Clinical validation
Applicable healthcare privacy and regulatory controls
Limitations

The current prototype uses predefined keywords and linguistic patterns.

Therefore, it may not recognize every possible way a healthcare professional could write the same information.

The system does not perform:

Disease diagnosis
Medical prediction
Prescription generation
Autonomous treatment decisions

The current AI component is focused on extracting documented continuity information from visit notes.

Future Enhancements

Future versions can include:

Clinical NLP or transformer-based models
Improved natural-language understanding
Multilingual clinical-note support
Larger validated clinical datasets
Integration with existing EHR systems
Improved recurrence detection
Advanced audit and access-control mechanisms
More comprehensive care-continuity tracking
