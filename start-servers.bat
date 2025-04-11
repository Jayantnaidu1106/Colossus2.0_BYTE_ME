@echo off
echo Starting Atlas AI Backend Servers...

echo.
echo Starting PDF Summarizer Flask Backend (Port 5000)...
start cmd /k "cd flask-backend && python simple_summarizer.py"

echo.
echo Starting AI Mock Interview Flask Backend (Port 5001)...
start cmd /k "cd flask-backend && python simple_interview_app.py"

echo.
echo Both servers are starting. Please wait...
echo.
echo - PDF Summarizer: http://localhost:5000
echo - AI Mock Interview: http://localhost:5001
echo.
echo You can now use both the PDF Summarizer and AI Mock Interview features!
echo.
echo Press any key to close this window...
pause > nul
