@echo off
echo ============================================
echo  Configurando inicio automatico do servidor
echo  de importacao .mpp (MPP Parser)
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Instalando dependencias...
call npm install
if errorlevel 1 ( echo ERRO: npm install falhou. & pause & exit /b 1 )

echo [2/3] Instalando pm2 globalmente...
call npm install -g pm2
if errorlevel 1 ( echo ERRO: pm2 install falhou. & pause & exit /b 1 )

echo [3/3] Registrando servidor para iniciar com o Windows...
call pm2 start mpp_server.js --name "mpp-parser"
call pm2 startup
call pm2 save

echo.
echo ============================================
echo  Pronto! O servidor MPP vai iniciar
echo  automaticamente com o Windows.
echo  Nenhuma janela aparecera.
echo ============================================
echo.
pause
