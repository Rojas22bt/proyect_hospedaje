@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         🏠 SISTEMA HABITA - INICIALIZADOR                ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

:menu
echo.
echo Selecciona una opción:
echo.
echo [1] 🚀 Configuración Inicial Completa (Primera vez)
echo [2] ⚡ Inicio Rápido (Backend + Frontend)
echo [3] 🗄️  Solo Backend
echo [4] 🎨 Solo Frontend
echo [5] 📊 Verificar Datos
echo [6] 🔄 Resetear Base de Datos
echo [7] ❌ Salir
echo.
set /p opcion="Ingresa el número de tu opción: "

if "%opcion%"=="1" goto inicial
if "%opcion%"=="2" goto rapido
if "%opcion%"=="3" goto backend
if "%opcion%"=="4" goto frontend
if "%opcion%"=="5" goto verificar
if "%opcion%"=="6" goto resetear
if "%opcion%"=="7" goto salir
goto menu

:inicial
echo.
echo ══════════════════════════════════════════════════════════
echo 🚀 CONFIGURACIÓN INICIAL COMPLETA
echo ══════════════════════════════════════════════════════════
echo.
echo Paso 1/5: Verificando estructura...
if not exist "PG-Habita-Backend" (
    echo ❌ Error: No se encuentra la carpeta PG-Habita-Backend
    pause
    goto menu
)
if not exist "PG-Habita-Frontend" (
    echo ❌ Error: No se encuentra la carpeta PG-Habita-Frontend
    pause
    goto menu
)
echo ✅ Estructura correcta
echo.

echo Paso 2/5: Configurando Backend...
cd PG-Habita-Backend
if exist "venv\Scripts\activate.bat" (
    echo ✅ Entorno virtual encontrado
) else (
    echo ⚠️  Creando entorno virtual...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo ✅ Entorno virtual activado
echo.

echo Paso 3/5: Instalando dependencias de Python...
pip install -r requirements.txt --quiet
echo ✅ Dependencias instaladas
echo.

echo Paso 4/5: Configurando base de datos...
python manage.py migrate
echo ✅ Migraciones aplicadas
echo.

echo Paso 5/5: Cargando datos de ejemplo...
python load_csv_data.py
echo.

cd ..
echo.
echo ══════════════════════════════════════════════════════════
echo ✅ ¡CONFIGURACIÓN COMPLETADA!
echo ══════════════════════════════════════════════════════════
echo.
echo Ahora puedes usar la opción [2] para iniciar el sistema
pause
goto menu

:rapido
echo.
echo ══════════════════════════════════════════════════════════
echo ⚡ INICIANDO SISTEMA COMPLETO
echo ══════════════════════════════════════════════════════════
echo.

echo Iniciando Backend en puerto 8000...
start "🗄️ Backend Habita" cmd /k "cd PG-Habita-Backend && venv\Scripts\activate.bat && python manage.py runserver"
timeout /t 3 /nobreak >nul

echo Iniciando Frontend en puerto 5173...
start "🎨 Frontend Habita" cmd /k "cd PG-Habita-Frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ══════════════════════════════════════════════════════════
echo ✅ SISTEMA INICIADO
echo ══════════════════════════════════════════════════════════
echo.
echo 📍 URLs importantes:
echo.
echo    🎨 Frontend:  http://localhost:5173
echo    🗄️  Backend:   http://localhost:8000/api/
echo    ⚙️  Admin:     http://localhost:8000/admin/
echo.
echo 🔐 Credenciales de prueba:
echo    Email:    admin@habita.com
echo    Password: admin123
echo.
echo ⚠️  Mantén estas ventanas abiertas para que el sistema funcione
echo.
pause
goto menu

:backend
echo.
echo ══════════════════════════════════════════════════════════
echo 🗄️  INICIANDO BACKEND
echo ══════════════════════════════════════════════════════════
echo.
cd PG-Habita-Backend
call venv\Scripts\activate.bat
echo Servidor backend iniciado en http://localhost:8000
echo Presiona Ctrl+C para detener
python manage.py runserver
cd ..
pause
goto menu

:frontend
echo.
echo ══════════════════════════════════════════════════════════
echo 🎨 INICIANDO FRONTEND
echo ══════════════════════════════════════════════════════════
echo.
cd PG-Habita-Frontend
echo Servidor frontend iniciado en http://localhost:5173
echo Presiona Ctrl+C para detener
npm run dev
cd ..
pause
goto menu

:verificar
echo.
echo ══════════════════════════════════════════════════════════
echo 📊 VERIFICANDO DATOS
echo ══════════════════════════════════════════════════════════
echo.
cd PG-Habita-Backend
call venv\Scripts\activate.bat
python verify_data.py
cd ..
pause
goto menu

:resetear
echo.
echo ══════════════════════════════════════════════════════════
echo 🔄 RESETEAR BASE DE DATOS
echo ══════════════════════════════════════════════════════════
echo.
echo ⚠️  ADVERTENCIA: Esto eliminará TODOS los datos existentes
echo.
set /p confirmar="¿Estás seguro? (S/N): "
if /i not "%confirmar%"=="S" (
    echo Operación cancelada
    pause
    goto menu
)
echo.
echo Reseteando base de datos...
cd PG-Habita-Backend
call venv\Scripts\activate.bat
python manage.py flush --noinput
echo.
echo Aplicando migraciones...
python manage.py migrate
echo.
echo Cargando datos de ejemplo...
python load_csv_data.py
cd ..
echo.
echo ✅ Base de datos reseteada correctamente
pause
goto menu

:salir
echo.
echo ══════════════════════════════════════════════════════════
echo 👋 ¡Hasta pronto!
echo ══════════════════════════════════════════════════════════
echo.
echo Para volver a iniciar el sistema, ejecuta este script nuevamente
echo.
timeout /t 3
exit

:error
echo.
echo ❌ Ha ocurrido un error
pause
goto menu
