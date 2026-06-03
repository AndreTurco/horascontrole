@echo off
title Tunel Alternativo - Controle de Horas
chcp 1252 > nul

echo ==========================================================
echo   INICIANDO TUNEL DE INTERNET ALTERNATIVO (SERVEO)
echo ==========================================================
echo.
echo [INFO] Este script cria uma conexao de internet estavel usando o SSH nativo do Windows.
echo [INFO] Nao requer nenhuma instalacao adicional.
echo.
echo [AVISO] Certifique-se de que o servidor principal esta rodando em outra janela (na porta 3080).
echo.
echo [INFO] Iniciando o tunel seguro...
echo.

ssh -o StrictHostKeyChecking=no -R 80:localhost:3080 serveo.net

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Ocorreu uma falha ao iniciar o tunel via SSH.
    echo [ERRO] Verifique se a sua internet esta ativa ou se o SSH do Windows esta habilitado.
    pause
)
