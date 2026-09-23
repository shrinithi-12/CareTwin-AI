# CareTwin AI — Secure Hackathon Build

CareTwin AI is a prototype Patient Medical Record System for PS34 with an authenticated staff workflow and an AI Care Continuity layer.

## What is included
- Authorized staff login using Spring Security + BCrypt + server-side session authentication.
- Patient registration/search/profile APIs protected by authentication.
- Visit records protected by authentication.
- AI analysis is **not called directly from the browser**. React calls Spring Boot, Spring Boot checks authentication, then calls the FastAPI AI service.
- AI Care State extraction: complaints, medication-change mentions, documented follow-up intention, recurrence signal, confidence and summary.
- Human verification warning before an AI-derived state is saved.
- Future Care Threads for documented follow-up intentions.
- SQLite local database and audit log table.

## Demo credentials
- Staff ID: `staff001`
- Password: `CareTwin@123`

The default staff password is encoded with BCrypt at first startup; the plain password is not stored in the database.

## Architecture

React :5173
  -> authenticated session cookie
Spring Boot :8080
  -> authorized API
  -> SQLite
  -> FastAPI :8000
FastAPI
  -> care-continuity extraction

The browser never calls FastAPI directly.

## Run on Windows

### 1. AI service
```cmd
cd /d D:\CareTwin_AI_Secure\ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Backend
Open another Command Prompt:
```cmd
cd /d D:\CareTwin_AI_Secure\backend
mvn spring-boot:run
```

### 3. Frontend
Open another Command Prompt:
```cmd
cd /d D:\CareTwin_AI_Secure\frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo flow
1. Login as authorized staff.
2. Register a patient.
3. Open the patient profile.
4. Add a visit.
5. Enter: `Patient reports recurring headache. Previous medicine was stopped due to discomfort. Review after 7 days.`
6. Click **Analyze with CareTwin AI**.
7. Review the extracted care state and human-verification notice.
8. Save the visit.
9. Open Care Threads to show the documented follow-up thread.

## Security note
This is a local hackathon prototype, not a production clinical system. Before real deployment, add HTTPS, secure secret management, CSRF protection appropriate to the final authentication architecture, stronger session/cookie policies, encryption at rest, least-privilege roles, audit review, rate limiting, backup/recovery, clinical validation and applicable privacy/regulatory controls.


## Important fixes in this build
- Login status no longer treats Spring Security's anonymous user as an authenticated staff user.
- The demo `staff001` account is created whenever it is missing, even if the database already contains other users.
- React API URL can be changed with `frontend/.env` using `VITE_API_URL`.
- Added a Vite React configuration and Windows startup scripts.
- Logout clears the UI even if the server logout request fails.

### Recommended startup order
Run each command in a separate Command Prompt:
1. `START_AI.cmd`
2. `START_BACKEND.cmd`
3. `START_FRONTEND.cmd`

Then open `http://localhost:5173`.

### If this is the first run
The backend creates `caretwin.db` automatically and seeds:
`staff001` / `CareTwin@123`

If you previously have a broken local database, stop the backend and delete `backend/caretwin.db`, then start the backend again. The schema and demo account will be recreated.
