from datetime import date, timedelta
import re
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="CareTwin AI Service",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VisitNote(BaseModel):
    note: str
    previous_notes: list[str] = Field(default_factory=list)


class AIResult(BaseModel):
    complaints: list[str]
    medication_change: Optional[str]
    follow_up_days: Optional[int]
    follow_up_intention: Optional[str]
    follow_up_date: Optional[str]
    signals: list[str]
    confidence: float
    summary: str


COMPLAINTS = [
    "headache",
    "fever",
    "cough",
    "pain",
    "gastritis",
    "acidity",
    "fatigue",
    "vomiting",
    "cold",
    "dizziness",
    "nausea"
]


def extract(note: str, previous: list[str]):

    text = (note or "").strip()
    low = text.lower()

    # -----------------------------
    # 1. Extract complaints
    # -----------------------------
    complaints = [
        x for x in COMPLAINTS
        if x in low
    ]

    signals = []
    medication_change = None

    # -----------------------------
    # 2. Detect medication changes
    # -----------------------------
    if any(
        x in low
        for x in [
            "stopped",
            "changed",
            "discontinued",
            "switched",
            "started",
            "dose increased",
            "dose reduced"
        ]
    ):
        medication_change = (
            "Medication change mentioned in the visit note"
        )

        signals.append("MEDICATION_CHANGE")

    # -----------------------------
    # 3. Detect follow-up
    # -----------------------------
    follow_days = None
    follow_intention = None

    pattern = re.search(
        r"(?:review|follow\s*-?up|followup|return|revisit|come\s+back)"
        r"(?:\s+(?:after|in|within|on))?"
        r"\s*(\d+)\s*(day|days|week|weeks)",
        low
    )

    if pattern:

        n = int(pattern.group(1))
        unit = pattern.group(2)

        if "week" in unit:
            follow_days = n * 7
        else:
            follow_days = n

        follow_intention = (
            f"Review/follow-up after {follow_days} days"
        )

        signals.append("FOLLOW_UP_INTENTION")

    # -----------------------------
    # 4. Complaint signal
    # -----------------------------
    if complaints:
        signals.append("COMPLAINT_EXTRACTED")

    # -----------------------------
    # 5. Detect recurrence
    # -----------------------------
    previous_low = " ".join(previous).lower()

    recurring = bool(
        complaints
        and any(c in previous_low for c in complaints)
    )

    if recurring:
        signals.append("RECURRENCE")

    # -----------------------------
    # 6. Confidence
    # -----------------------------
    confidence = (
        0.92
        if complaints or follow_days or medication_change
        else 0.72
    )

    if recurring:
        confidence = min(
            0.96,
            confidence + 0.03
        )

    # -----------------------------
    # 7. Summary
    # -----------------------------
    summary_parts = []

    if complaints:
        summary_parts.append(
            "Complaint: " + ", ".join(complaints)
        )

    if medication_change:
        summary_parts.append(
            medication_change
        )

    if follow_intention:
        summary_parts.append(
            follow_intention
        )

    summary = (
        ". ".join(summary_parts)
        if summary_parts
        else
        "No supported care-continuity signal was extracted from this note."
    )

    # -----------------------------
    # 8. Calculate follow-up date
    # -----------------------------
    follow_date = None

    if follow_days:
        follow_date = (
            date.today() +
            timedelta(days=follow_days)
        ).isoformat()

    # -----------------------------
    # 9. Return AI result
    # -----------------------------
    return {
        "complaints": complaints,
        "medication_change": medication_change,
        "follow_up_days": follow_days,
        "follow_up_intention": follow_intention,
        "follow_up_date": follow_date,
        "signals": signals,
        "confidence": round(confidence, 2),
        "summary": summary,
        "human_verification_required": True,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "CareTwin AI"
    }


@app.post("/analyze-visit", response_model=AIResult)
def analyze_visit(note: VisitNote):
    return extract(
        note.note,
        note.previous_notes
    )