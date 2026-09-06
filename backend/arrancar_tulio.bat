@echo off
title CEREBRO BASECAMP - TULIO (Multi-SICAR)

echo ==================================================
echo Iniciando Servidor Node.js (Bases de datos SICAR)...
echo ==================================================
start cmd /k "cd /d C:\Tulio_Servidor && node sicar_multi_db.js"

echo Esperando 3 segundos para que el servidor este listo...
timeout /t 3 /nobreak >nul

echo ==================================================
echo Iniciando Asistente de Voz Tulio...
echo ==================================================
start cmd /k "cd /d C:\Tulio_Servidor && py tulio_local.py"
