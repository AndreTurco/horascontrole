@echo off
title Servidor - Controle de Horas Premium
chcp 1252 > nul

echo ==========================================================
echo   INICIANDO O SISTEMA DE CONTROLE DE HORAS PREMIUM
echo ==========================================================
echo.
echo [INFO] Verificando dependencias do projeto...

if not exist node_modules (
    echo [INFO] Pasta node_modules nao encontrada. Instalando dependencias...
    echo [INFO] Isso pode levar alguns segundos, por favor aguarde...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Ocorreu uma falha ao instalar as dependencias do npm.
        echo [ERRO] Certifique-se de que o Node.js esta instalado e voce tem acesso a internet.
        pause
        exit /b
    )
    echo [INFO] Dependencias instaladas com sucesso!
) else (
    echo [INFO] Dependencias ja instaladas.
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
