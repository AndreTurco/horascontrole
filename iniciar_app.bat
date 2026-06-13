@echo off
title Controle de Horas Premium - Desktop
chcp 1252 > nul

echo ==========================================================
echo   INICIANDO O SISTEMA DE CONTROLE DE HORAS PREMIUM (EXE)
echo ==========================================================
echo.

echo [INFO] Finalizando processos antigos do aplicativo...
taskkill /f /im controle-de-horas.exe >nul 2>&1

echo [INFO] Liberando a porta 3080 caso esteja em uso...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3080 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [INFO] Iniciando o aplicativo desktop Electron...
echo.

if not exist "dist\controle-de-horas-win32-x64\controle-de-horas.exe" (
    echo [ERRO] O executavel do aplicativo nao foi encontrado em dist\controle-de-horas-win32-x64!
    echo Por favor, execute o empacotamento primeiro: npm run package-desktop
    echo.
    pause
    exit /b
)

start "" "dist\controle-de-horas-win32-x64\controle-de-horas.exe"

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O aplicativo encontrou um problema ao iniciar.
    pause
)
