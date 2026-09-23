@echo off
cd /d "%~dp0ai-service"
if not exist venv\Scripts\python.exe (
  py -3 -m venv venv
  if errorlevel 1 python -m venv venv
)
call venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
