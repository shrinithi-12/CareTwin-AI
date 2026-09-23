CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL UNIQUE,
 password TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'STAFF',
 enabled INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS patients (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 patient_code TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 dob TEXT,
 gender TEXT,
 phone TEXT,
 email TEXT,
 address TEXT,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS visits (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 patient_id INTEGER NOT NULL,
 visit_date TEXT NOT NULL,
 diagnosis TEXT,
 medicine TEXT,
 notes TEXT,
 ai_state_json TEXT,
 ai_verified INTEGER NOT NULL DEFAULT 0,
 follow_up_date TEXT,
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL,
 FOREIGN KEY(patient_id) REFERENCES patients(id)
);
CREATE TABLE IF NOT EXISTS care_threads (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 patient_id INTEGER NOT NULL,
 source_visit_id INTEGER NOT NULL,
 expected_date TEXT,
 type TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'PENDING',
 linked_visit_id INTEGER,
 source_text TEXT,
 created_at TEXT NOT NULL,
 FOREIGN KEY(patient_id) REFERENCES patients(id),
 FOREIGN KEY(source_visit_id) REFERENCES visits(id),
 FOREIGN KEY(linked_visit_id) REFERENCES visits(id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL,
 action TEXT NOT NULL,
 entity_type TEXT NOT NULL,
 entity_id INTEGER,
 details TEXT,
 created_at TEXT NOT NULL
);
