@echo off
setlocal

set "ROOT=%~dp0"
set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"

if not exist "%CLOUDFLARED%" (
  set "CLOUDFLARED=C:\Program Files\cloudflared\cloudflared.exe"
)

if not exist "%CLOUDFLARED%" (
  echo Cloudflared not found.
  echo Install it first, then run this file again.
  pause
  exit /b 1
)

start "Next.js Dev Server" cmd /k "cd /d ""%ROOT%"" && npm run dev"
timeout /t 4 /nobreak >nul
start "Cloudflare Tunnel" cmd /k "cd /d ""%ROOT%"" && ""%CLOUDFLARED%"" tunnel --url http://localhost:3000 --no-autoupdate"

echo Local environment is starting...
echo 1. Wait for the Next.js window to say it is ready.
echo 2. In the Cloudflare window, copy the trycloudflare URL.
echo 3. In Meta, set Callback URL to: YOUR_URL/api/webhook
echo 4. Keep both windows open while testing Messenger.
pause
