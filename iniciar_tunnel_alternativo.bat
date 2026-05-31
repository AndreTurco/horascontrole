@echo off
title Túnel Alternativo - Controle de Horas
chcp 65001 > nul

echo ==========================================================
echo   INICIANDO TÚNEL DE INTERNET ALTERNATIVO (SERVEO)
echo ==========================================================
echo.
echo [INFO] Este script cria uma conexão de internet estável usando o SSH nativo do Windows.
echo [INFO] Não requer nenhuma instalação adicional.
echo.
echo [AVISO] Certifique-se de que o servidor principal está rodando em outra janela (na porta 3080).
echo.
echo [INFO] Iniciando o túnel seguro...
echo.

ssh -o StrictHostKeyChecking=no -R 80:localhost:3080 serveo.net

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Ocorreu uma falha ao iniciar o túnel via SSH.
    echo [ERRO] Verifique se a sua internet está ativa ou se o SSH do Windows está habilitado.
    pause
)
