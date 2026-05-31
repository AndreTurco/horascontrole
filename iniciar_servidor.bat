@echo off
title Servidor - Controle de Horas Premium
chcp 65001 > nul

echo ==========================================================
echo   INICIANDO O SISTEMA DE CONTROLE DE HORAS PREMIUM
echo ==========================================================
echo.
echo [INFO] Verificando dependências do projeto...

if not exist node_modules (
    echo [INFO] Pasta node_modules não encontrada. Instalando dependências...
    echo [INFO] Isso pode levar alguns segundos, por favor aguarde...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Ocorreu uma falha ao instalar as dependências do npm.
        echo [ERRO] Certifique-se de que o Node.js está instalado e você tem acesso à internet.
        pause
        exit /b
    )
    echo [INFO] Dependências instaladas com sucesso!
) else (
    echo [INFO] Dependências já instaladas.
)

echo.
echo [INFO] Iniciando o servidor local...
echo.

node server.js

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O servidor encontrou um problema ao iniciar.
    pause
)
