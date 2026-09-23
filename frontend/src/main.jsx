import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const req = async (url, options = {}) => {
  const r = await fetch(url, {
    credentials: 'include',
    ...options
  });

  if (!r.ok) {
    let msg = 'Request failed';
    try {
      const x = await r.json();
      msg = x.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return r.json();
};

function Login({ onLogin }) {
  const [u, setU] = useState('staff001');
  const [p, setP] = useState('CareTwin@123');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setErr('');

    try {
      const x = await req(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: u,
          password: p
        })
      });

      onLogin(x);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">

        <div className="logo">
          <b>C</b>
          <div>
            <strong>
              CareTwin <span>AI</span>
            </strong>
            <small>Patient Care Continuity</small>
          </div>
        </div>

        <h1>Authorized Staff Login</h1>

        <p className="muted">
          Access to patient records and AI-assisted visit analysis is restricted
          to authorized staff.
        </p>

        <form onSubmit={submit}>
          <label>
            Staff ID
            <input
              value={u}
              onChange={e => setU(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={p}
              onChange={e => setP(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {err && <div className="error">⚠ {err}</div>}

          <button className="primary full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in securely'}
          </button>
        </form>

        <div className="demo">
          Demo staff: <b>staff001</b> / <b>CareTwin@123</b>
        </div>

      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    req(`${API}/auth/status`)
      .then(x => setUser(x))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading">Loading CareTwin…</div>;
  }

  return user
    ? <Dashboard user={user} onLogout={() => setUser(null)} />
    : <Login onLogin={setUser} />;
}

function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [q, setQ] = useState('');
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [threads, setThreads] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const refresh = async () => {
    try {
      const [s, p, t] = await Promise.all([
        req(`${API}/dashboard/stats`),
        req(`${API}/patients?q=${encodeURIComponent(q)}`),
        req(`${API}/threads`)
      ]);

      setStats(s);
      setPatients(p);
      setThreads(t);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (tab === 'patients') {
        req(`${API}/patients?q=${encodeURIComponent(q)}`)
          .then(setPatients)
          .catch(() => {});
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q, tab]);

  const open = async id => {
    try {
      const patient = await req(`${API}/patients/${id}`);

      // FIX:
      // Backend returns patient details directly.
      // There is no patient.patient object.
      setSelected(patient);
      setTab('patients');
    } catch (e) {
      setError(e.message);
    }
  };

  const logout = async () => {
    try {
      await req(`${API}/auth/logout`, {
        method: 'POST'
      });
    } finally {
      onLogout();
    }
  };

  return (
    <div className="app">

      <aside>

        <div className="brand">
          <b>C</b>
          <div>
            <strong>
              CareTwin <span>AI</span>
            </strong>
            <small>Care Continuity</small>
          </div>
        </div>

        <nav>

          <button
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => setTab('dashboard')}
          >
            ⌂ Dashboard
          </button>

          <button
            className={tab === 'patients' ? 'active' : ''}
            onClick={() => setTab('patients')}
          >
            ♙ Patient Records
          </button>

          <button
            className={tab === 'threads' ? 'active' : ''}
            onClick={() => setTab('threads')}
          >
            ↗ Care Threads
          </button>

        </nav>

        <div className="sideBottom">
          🔒 Authorized Staff
          <br />

          <small>{user.username}</small>

          <button onClick={logout}>
            Logout
          </button>
        </div>

      </aside>

      <main>

        <header>

          <div>
            <div className="eyebrow">
              PATIENT CARE CONTINUITY
            </div>

            <h1>
              {tab === 'dashboard'
                ? 'CareTwin AI Dashboard'
                : tab === 'patients'
                  ? 'Patient Records'
                  : 'Future Care Threads'}
            </h1>

            <p>
              Securely manage patient records and use AI to organize
              documented care continuity.
            </p>
          </div>

          <div className="badge">
            ● {user.role.replace('ROLE_', '')}
          </div>

        </header>

        {error && (
          <div className="error bar">
            ⚠ {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {toast && (
          <div className="success bar">
            ✓ {toast}
          </div>
        )}

        {tab === 'dashboard' && (
          <Home
            stats={stats}
            threads={threads.filter(x => x.status === 'PENDING')}
            onRegister={() => setModal('patient')}
            onPatients={() => setTab('patients')}
            open={open}
          />
        )}

        {tab === 'patients' && (
          <Patients
            q={q}
            setQ={setQ}
            patients={patients}
            selected={selected}
            open={open}
            onRegister={() => setModal('patient')}
            onVisit={() => selected && setModal('visit')}
          />
        )}

        {tab === 'threads' && (
          <Threads
            threads={threads}
            open={open}
          />
        )}

      </main>

      {modal === 'patient' && (
        <PatientModal
          close={() => setModal(null)}
          done={async () => {
            setModal(null);
            await refresh();
            setToast('Patient registered successfully.');
          }}
        />
      )}

      {modal === 'visit' && (
        <VisitModal
          patient={selected}
          close={() => setModal(null)}
          done={async () => {
            setModal(null);
            await refresh();

            // FIX:
            // selected itself is the patient object.
            await open(selected.id);

            setToast('Visit saved and care continuity updated.');
          }}
        />
      )}

    </div>
  );
}

function Home({
  stats,
  threads,
  onRegister,
  onPatients,
  open
}) {
  return (
    <>
      <div className="stats">

        <Stat
          n={stats.patients ?? 0}
          t="Registered Patients"
        />

        <Stat
          n={stats.todayVisits ?? 0}
          t="Visits Today"
        />

        <Stat
          n={stats.pendingThreads ?? 0}
          t="Pending Care Threads"
        />

        <Stat
          n={stats.recordBlindSpots ?? 0}
          t="Record Blind Spots"
        />

      </div>

      <section className="card">

        <div className="sectionHead">

          <div>
            <h2>Quick actions</h2>
            <p>
              All patient operations require authenticated staff access.
            </p>
          </div>

          <div className="actions">

            <button
              className="outline"
              onClick={onPatients}
            >
              Search patients
            </button>

            <button
              className="primary"
              onClick={onRegister}
            >
              + Register patient
            </button>

          </div>

        </div>

        <div className="securityNote">
          🔐 <b>Protected workflow:</b> Login → authorized staff →
          patient registration → visit record → AI analysis → human verification.
        </div>

      </section>

      <section className="card">

        <div className="sectionHead">

          <div>
            <h2>Pending care threads</h2>
            <p>
              Documented follow-up intentions waiting for staff review.
            </p>
          </div>

        </div>

        {threads.length ? (
          threads.slice(0, 5).map(t => (
            <button
              className="thread"
              key={t.id}
              onClick={() => open(t.patient_id)}
            >
              <span>↗</span>

              <div>
                <b>{t.patient_name}</b>
                <small>
                  {t.source_text || 'Follow-up intention'}
                  {' · '}
                  Expected {t.expected_date || '—'}
                </small>
              </div>

              <i>PENDING</i>
            </button>
          ))
        ) : (
          <div className="empty">
            No pending care threads.
          </div>
        )}

      </section>
    </>
  );
}

const Stat = ({ n, t }) => (
  <div className="stat">
    <strong>{n}</strong>
    <span>{t}</span>
  </div>
);

function Patients({
  q,
  setQ,
  patients,
  selected,
  open,
  onRegister,
  onVisit
}) {
  return (
    <div className="patientLayout">

      <section className="card list">

        <div className="sectionHead">

          <div>
            <h2>Patients</h2>
            <p>
              Search by name, patient ID or phone.
            </p>
          </div>

          <button
            className="primary"
            onClick={onRegister}
          >
            + Register
          </button>

        </div>

        <input
          className="search"
          placeholder="Search patient…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />

        {patients.map(p => (

          <button
            className={
              'patientRow ' +
              (selected?.id === p.id ? 'sel' : '')
            }
            key={p.id}
            onClick={() => open(p.id)}
          >

            <span className="avatar">
              {p.name?.[0]?.toUpperCase()}
            </span>

            <div>
              <b>{p.name}</b>
              <small>
                {p.patient_code}
                {' · '}
                {p.phone || 'No phone'}
              </small>
            </div>

          </button>

        ))}

        {!patients.length && (
          <div className="empty">
            No patients found.
          </div>
        )}

      </section>

      <section className="card profile">

        {selected ? (

          <>

            <div className="profileTop">

              <div>

                <span className="avatar big">
                  {selected.name?.[0]?.toUpperCase()}
                </span>

                <div>
                  <h2>{selected.name}</h2>
                  <small>{selected.patient_code}</small>
                </div>

              </div>

              <button
                className="primary"
                onClick={onVisit}
              >
                + Add visit
              </button>

            </div>

            <div className="info">
              DOB: {selected.dob || '—'}
              {' · '}
              Gender: {selected.gender || '—'}
              {' · '}
              Phone: {selected.phone || '—'}
              {' · '}
              Email: {selected.email || '—'}
            </div>

            <h3>Visit history</h3>

            {selected.visits?.length ? (

              selected.visits.map(v => (

                <div
                  className="visit"
                  key={v.id}
                >

                  <b>{v.visit_date}</b>

                  <strong>
                    {v.diagnosis || 'Visit'}
                  </strong>

                  <p>
                    {v.notes || 'No notes'}
                  </p>

                  <div className="chips">

                    {v.ai_verified ? (
                      <span>
                        ✓ AI verified
                      </span>
                    ) : null}

                    {v.follow_up_date ? (
                      <span>
                        Follow-up: {v.follow_up_date}
                      </span>
                    ) : null}

                  </div>

                </div>

              ))

            ) : (

              <div className="empty">
                No visits yet. Add the first visit to start the
                CareTwin timeline.
              </div>

            )}

          </>

        ) : (

          <div className="empty tall">
            Select a patient to view their complete record.
          </div>

        )}

      </section>

    </div>
  );
}

function Threads({ threads, open }) {
  return (
    <section className="card">

      <div className="sectionHead">

        <div>
          <h2>Future Care Threads</h2>
          <p>
            Documented follow-up intentions remain visible until
            staff reviews them.
          </p>
        </div>

      </div>

      {threads.map(t => (

        <button
          className="thread"
          key={t.id}
          onClick={() => open(t.patient_id)}
        >

          <span>↗</span>

          <div>
            <b>
              {t.patient_name} · {t.patient_code}
            </b>

            <small>
              {t.source_text}
              {' · '}
              Expected {t.expected_date || '—'}
            </small>
          </div>

          <i>{t.status}</i>

        </button>

      ))}

      {!threads.length && (
        <div className="empty">
          No care threads.
        </div>
      )}

    </section>
  );
}

function PatientModal({ close, done }) {

  const [f, setF] = useState({
    name: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    address: ''
  });

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async e => {

    e.preventDefault();

    if (!f.name.trim()) {
      return setErr('Patient name is required.');
    }

    setBusy(true);
    setErr('');

    try {

      await req(`${API}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(f)
      });

      await done();

    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Register New Patient"
      close={close}
    >

      <form onSubmit={save}>

        <div className="grid2">

          <Field
            label="Full name"
            value={f.name}
            set={v => setF({ ...f, name: v })}
          />

          <Field
            label="Date of birth"
            type="date"
            value={f.dob}
            set={v => setF({ ...f, dob: v })}
          />

          <Field
            label="Gender"
            value={f.gender}
            set={v => setF({ ...f, gender: v })}
          />

          <Field
            label="Phone"
            value={f.phone}
            set={v => setF({ ...f, phone: v })}
          />

          <Field
            label="Email"
            value={f.email}
            set={v => setF({ ...f, email: v })}
          />

          <Field
            label="Address"
            value={f.address}
            set={v => setF({ ...f, address: v })}
          />

        </div>

        {err && (
          <div className="error">
            ⚠ {err}
          </div>
        )}

        <div className="modalActions">

          <button
            type="button"
            className="outline"
            onClick={close}
          >
            Cancel
          </button>

          <button
            className="primary"
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Register patient'}
          </button>

        </div>

      </form>

    </Modal>
  );
}

function Field({
  label,
  type = 'text',
  value,
  set
}) {
  return (
    <label>
      {label}

      <input
        type={type}
        value={value}
        onChange={e => set(e.target.value)}
      />
    </label>
  );
}

function VisitModal({
  patient,
  close,
  done
}) {

  const [f, setF] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    diagnosis: '',
    medicine: '',
    notes: ''
  });

  const [ai, setAi] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const analyze = async () => {

    if (!f.notes.trim()) {
      return setErr('Enter visit notes first.');
    }

    setBusy(true);
    setErr('');

    try {

      const previous = (patient.visits || [])
        .map(v => v.notes || '')
        .filter(Boolean)
        .slice(0, 5);
        const response = await fetch(
  'http://127.0.0.1:8000/analyze-visit',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      note: f.notes,
      previous_notes: previous
    })
  }
);

if (!response.ok) {
  throw new Error('AI analysis failed.');
}

const result = await response.json();
setAi(result);

    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {

    if (!f.notes.trim()) {
      return setErr('Visit notes are required.');
    }

    setSaving(true);
    setErr('');

    try {

      const follow = ai?.follow_up_days
        ? new Date(
            new Date(f.visitDate).getTime() +
            ai.follow_up_days * 86400000
          )
            .toISOString()
            .slice(0, 10)
        : null;

      const v = await req(`${API}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: patient.id,
          ...f,
          followUpDate: follow,
          aiStateJson: ai ? JSON.stringify(ai) : null,
          aiVerified: Boolean(ai)
        })
      });

      if (ai?.follow_up_days) {

        await req(`${API}/threads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patientId: patient.id,
            sourceVisitId: v.id,
            expectedDate: follow,
            type: 'FOLLOW_UP',
            sourceText: ai.follow_up_intention
          })
        });

      }

      await done();

    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      wide
      title={`Add Visit · ${patient.name}`}
      close={close}
    >

      <div className="visitGrid">

        <div>

          <div className="grid2">

            <Field
              label="Visit date"
              type="date"
              value={f.visitDate}
              set={v => setF({ ...f, visitDate: v })}
            />

            <Field
              label="Diagnosis"
              value={f.diagnosis}
              set={v => setF({ ...f, diagnosis: v })}
            />

            <Field
              label="Medicine"
              value={f.medicine}
              set={v => setF({ ...f, medicine: v })}
            />

          </div>

          <label>
            Visit notes

            <textarea
              value={f.notes}
              onChange={e => setF({ ...f, notes: e.target.value })}
              placeholder="Example: Patient reports recurring headache. Previous medicine was stopped due to discomfort. Review after 7 days."
            />
          </label>

          <button
            className="aiBtn"
            onClick={analyze}
            disabled={busy}
          >
            {busy
              ? 'Analyzing…'
              : '✦ Analyze with CareTwin AI'}
          </button>

          {err && (
            <div className="error">
              ⚠ {err}
            </div>
          )}

        </div>

        <div className="aiBox">

          {ai ? (

            <>
              <div className="aiTitle">
                <b>AI Care State</b>

                <span>
                  {Math.round(ai.confidence * 100)}
                  % extraction confidence
                </span>
              </div>

              <p>
                <b>Summary:</b> {ai.summary}
              </p>

              <Row
                k="Complaints"
                v={
                  ai.complaints?.join(', ') ||
                  'None extracted'
                }
              />

              <Row
                k="Medication change"
                v={
                  ai.medication_change ||
                  'None detected'
                }
              />

              <Row
                k="Follow-up intention"
                v={
                  ai.follow_up_intention ||
                  'None detected'
                }
              />

              <Row
                k="Signals"
                v={
                  ai.signals?.join(', ') ||
                  'None'
                }
              />

              <div className="verify">
                🔎 <b>Human verification required.</b>
                Review the AI output before saving it as part
                of the official visit record.
              </div>

            </>

          ) : (

            <div className="aiEmpty">

              ✦

              <h3>CareTwin AI</h3>

              <p>
                Analyze the documented note to extract
                care-continuity signals. AI does not diagnose
                or prescribe.
              </p>

            </div>

          )}

        </div>

      </div>

      <div className="modalActions">

        <button
          className="outline"
          onClick={close}
        >
          Cancel
        </button>

        <button
          className="primary"
          onClick={save}
          disabled={saving}
        >
          {saving
            ? 'Saving…'
            : 'Save verified visit'}
        </button>

      </div>

    </Modal>
  );
}

const Row = ({ k, v }) => (
  <div className="aiRow">
    <small>{k}</small>
    <b>{v}</b>
  </div>
);

const Modal = ({
  title,
  close,
  children,
  wide
}) => (
  <div className="overlay">

    <div className={'modal ' + (wide ? 'wide' : '')}>

      <div className="modalTitle">

        <h2>{title}</h2>

        <button onClick={close}>
          ×
        </button>

      </div>

      {children}

    </div>

  </div>
);

createRoot(
  document.getElementById('root')
).render(<App />);