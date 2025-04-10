@echo off
echo Starting Atlas AI Application...

echo.
echo Starting Flask Backend...
start cmd /k "cd flask-backend && python -m pip install -r requirements.txt && python app.py"

echo.
echo Starting Next.js Frontend...
start cmd /k "npm run dev"

echo.
echo Both services are starting. Please wait...
echo.
echo - Next.js Frontend: http://localhost:3000
echo - Flask Backend: http://localhost:5000
echo.
echo You can now use the PDF Summarizer feature!
