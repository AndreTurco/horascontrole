@echo off
title Controle de Horas Premium - Desktop
chcp 1252 > nul

echo ==========================================================
echo   INICIANDO O SISTEMA DE CONTROLE DE HORAS PREMIUM (EXE)
echo ==========================================================
echo.

echo [INFO] Liberando a porta 3080 caso esteja em uso...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3080 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [INFO] Iniciando o aplicativo desktop...
echo.

controle-de-horas.exe

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O aplicativo encontrou um problema ao iniciar.
    pause
)
