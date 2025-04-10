@echo off
echo Starting Atlas AI Mock Interview Application...

echo.
echo Starting Flask Backend for Mock Interview...
start cmd /k "cd flask-backend && python mock_interview_app.py"

echo.
echo Starting Next.js Frontend...
start cmd /k "npm run dev"

echo.
echo Both services are starting. Please wait...
echo.
echo - Next.js Frontend: http://localhost:3000
echo - Flask Backend for Mock Interview: http://localhost:5001
echo.
echo You can now use the AI Mock Interview feature by navigating to:
echo http://localhost:3000/studytools/mockinterview
echo.
