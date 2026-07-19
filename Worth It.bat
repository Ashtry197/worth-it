@echo off
setlocal
title Worth It  --  close this window to stop the server
cd /d "%~dp0"

set "PORT=4173"
set "URL=http://localhost:%PORT%"
set "NODE=%ProgramFiles%\nodejs\node.exe"

echo.
echo   Worth It
echo   ========
echo.

REM Fall back to whatever is on PATH if Node isn't in the usual place.
if not exist "%NODE%" set "NODE=node"

REM Probe by running it — the surest test that it works, and it avoids
REM %ProgramFiles(x86)%, whose closing paren breaks parenthesised if-blocks.
"%NODE%" --version >nul 2>&1
if errorlevel 1 (
  echo   Node could not be found.
  echo.
  echo   Install it from https://nodejs.org then run this again.
  echo.
  pause
  exit /b 1
)

REM The server needs the built site. Building needs the installed packages,
REM which live in WSL, so that step runs there. It happens once.
if not exist "out\index.html" (
  echo   The site has not been built yet.
  echo   Building now - a couple of minutes, one time only.
  echo.
  wsl.exe --cd "%~dp0" -e bash -lc "npm run build"
  echo.

  if not exist "out\index.html" (
    echo   The build did not produce out\index.html.
    echo.
    echo   Open a terminal in this folder and run:
    echo       npm run build
    echo.
    pause
    exit /b 1
  )
)

REM Open the browser only once the port is actually accepting connections,
REM so you never land on a "can't reach this site" page.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for($i=0;$i -lt 60;$i++){try{$c=New-Object Net.Sockets.TcpClient('127.0.0.1',%PORT%);$c.Close();Start-Process '%URL%';break}catch{Start-Sleep -Milliseconds 500}}"

echo   Serving at %URL%
echo   Your browser will open in a moment.
echo.
echo   Leave this window open while you use the page.
echo   Close it, or press Ctrl+C, when you are done.
echo.

"%NODE%" scripts\serve.mjs

echo.
echo   Server stopped.
echo.
pause
endlocal
