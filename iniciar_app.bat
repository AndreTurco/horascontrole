@echo off
title Controle de Horas Premium
chcp 1252 > nul

echo ==========================================================
echo   CONTROLE DE HORAS PREMIUM - INICIANDO...
echo ==========================================================
echo.

:: Fechar instancias antigas
echo [1/4] Encerrando processos antigos...
taskkill /f /im "controle-de-horas.exe" >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3080" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

:: Verificar node_modules
echo [2/4] Verificando dependencias...
if not exist node_modules (
    echo     Instalando dependencias (primeira vez, aguarde)...
    call npm install --quiet --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias. Verifique sua conexao com internet.
        pause
        exit /b
    )
)

:: Iniciar servidor em segundo plano
echo [3/4] Iniciando servidor local na porta 3080...
start "Servidor - Controle de Horas" /min cmd /k "node server.js"
timeout /t 3 /nobreak >nul

:: Abrir interface
echo [4/4] Abrindo aplicativo...
if exist "dist\controle-de-horas-win32-x64\controle-de-horas.exe" (
    start "" "dist\controle-de-horas-win32-x64\controle-de-horas.exe"
    echo.
    echo [OK] Aplicativo desktop aberto!
) else (
    start "" "http://localhost:3080"
    echo.
    echo [OK] Aplicativo aberto no navegador (http://localhost:3080)
)

echo.
echo ==========================================================
echo   SERVIDOR RODANDO EM SEGUNDO PLANO
echo   Para encerrar tudo, feche a janela "Servidor" minimizada
echo ==========================================================
