@echo off
title Configuracao de 1 Toque - Controle Premium
chcp 1252 > nul

echo ================================================================
echo    BEM-VINDO AO SISTEMA DE CONTROLE DE HORAS PREMIUM
echo ================================================================
echo.
echo [PASSO 1/3] Verificando pre-requisitos do sistema...

:: Verificar se o Node.js esta instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ALERTA] O Node.js nao foi encontrado no seu computador!
    echo Para que o aplicativo funcione sem depender do computador de outras pessoas,
    echo voce precisa instalar o Node.js uma unica vez.
    echo.
    echo [DICA] Baixe e instale a versao LATEST LTS no site oficial:
    echo        https://nodejs.org/
    echo.
    echo Abrindo o site de download no seu navegador...
    start https://nodejs.org/
    echo.
    echo Instale o Node.js baixado e depois execute este arquivo novamente.
    echo.
    pause
    exit /b
)

echo [OK] Node.js detectado com sucesso:
for /f "tokens=*" %%i in ('node -v') do echo   %%i

echo.
echo [PASSO 2/3] Instalando dependencias necessarias de forma silenciosa...
echo (Isso leva cerca de 15 segundos na primeira inicializacao)

if not exist node_modules (
    call npm install --quiet --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao instalar dependencias do npm.
        echo Certifique-se de que esta conectado a internet e tente novamente.
        pause
        exit /b
    )
    echo [OK] Dependencias instaladas com sucesso!
) else (
    echo [OK] Dependencias ja estao configuradas.
)

echo.
echo [PASSO 3/3] Inicializando o Banco de Dados Excel...
echo Gerando planilha 2026 limpa automaticamente se ausente...

:: Iniciar o servidor em segundo plano e abrir o navegador automaticamente apos 1.5s
echo.
echo [INFO] Liberando a porta 3080 caso esteja em uso...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3080 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [SUCESSO] Tudo pronto! Inicializando Servidor Premium...
echo O aplicativo abrira no seu navegador em instantes...
echo.

start "" "http://localhost:3080"
node server.js

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Ocorreu um problema ao rodar o servidor.
    pause
)
