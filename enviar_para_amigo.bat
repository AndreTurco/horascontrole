@echo off
title Configuração de 1 Toque - Controle Premium
chcp 65001 > nul

:: Definir cores ANSI
set "ESC="
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "RED=%ESC%[91m"
set "CYAN=%ESC%[96m"
set "RESET=%ESC%[0m"

echo %CYAN%================================================================%RESET%
echo %CYAN%   ★ BEM-VINDO AO SISTEMA DE CONTROLE DE HORAS PREMIUM ★   %RESET%
echo %CYAN%================================================================%RESET%
echo.
echo %GREEN%[PASSO 1/3]%RESET% Verificando pré-requisitos do sistema...

:: Verificar se o Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo %RED%[ALERTA]%RESET% O Node.js não foi encontrado no seu computador!
    echo Para que o aplicativo funcione sem depender do computador de outras pessoas,
    echo você precisa instalar o Node.js uma única vez.
    echo.
    echo %YELLOW%[DICA]%RESET% Baixe e instale a versão LATEST LTS no site oficial:
    echo        https://nodejs.org/
    echo.
    echo Abrindo o site de download no seu navegador...
    start https://nodejs.org/
    echo.
    echo %YELLOW%Instale o Node.js baixado e depois execute este arquivo novamente.%RESET%
    echo.
    pause
    exit /b
)

echo %GREEN%[OK]%RESET% Node.js detectado com sucesso:
for /f "tokens=*" %%i in ('node -v') do echo   > %%i

echo.
echo %GREEN%[PASSO 2/3]%RESET% Instalando dependências necessárias de forma silenciosa...
echo %YELLOW%(Isso leva cerca de 15 segundos na primeira inicialização)%RESET%

if not exist node_modules (
    call npm.cmd install --quiet --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo.
        echo %RED%[ERRO]%RESET% Falha ao instalar dependências do npm.
        echo Certifique-se de que está conectado à internet e tente novamente.
        pause
        exit /b
    )
    echo %GREEN%[OK]%RESET% Dependências instaladas com sucesso!
) else (
    echo %GREEN%[OK]%RESET% Dependências já estão configuradas.
)

echo.
echo %GREEN%[PASSO 3/3]%RESET% Inicializando o Banco de Dados Excel...
echo %YELLOW%Gerando planilha 2026 limpa automaticamente se ausente...%RESET%

:: Iniciar o servidor em segundo plano e abrir o navegador automaticamente após 1.5s
echo.
echo %GREEN%[SUCESSO]%RESET% Tudo pronto! Inicializando Servidor Premium...
echo %CYAN%O aplicativo abrirá no seu navegador em instantes...%RESET%
echo.

start "" "http://localhost:3080"
node server.js

if %errorlevel% neq 0 (
    echo.
    echo %RED%[ERRO]%RESET% Ocorreu um problema ao rodar o servidor.
    pause
)
