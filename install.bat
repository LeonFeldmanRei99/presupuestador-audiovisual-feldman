@echo off
echo ========================================================
echo   Instalador del Cotizador Audiovisual - Leon Feldman
echo ========================================================
echo.
echo Instalando dependencias npm...
npm install
echo.
echo Creando carpetas necesarias...
if not exist "data" mkdir data
echo.
echo ========================================================
echo   Instalación completada con exito!
echo   Ejecuta run.bat para iniciar el servidor.
echo ========================================================
pause