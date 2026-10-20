# Reto Finabien · Puerquito Ahorrador

Juegos de educación financiera para las ferias y eventos de FINABIEN. Corre en una PC conectada a una TV o proyector, o en tablets: cada persona se registra con su nombre y su edad, juega, acumula puntos y los canjea por premios en el stand.

Este proyecto reúne en una sola aplicación Laravel lo que antes eran dos repositorios: **Reto Finabien** (`reto-bienestar`) y **Puerquito Ahorrador**.

## Juegos

### Retos de educación financiera

| Juego | Cómo se juega | Puntos |
|---|---|---|
| **Trivia Bienestar** | Preguntas de opción múltiple con tiempo. | 50 por acierto + hasta 25 por rapidez |
| **Decide rápido** | Mandar cada tarjeta a la cubeta correcta antes de que se acabe el tiempo. Para menores es "¿Necesidad o deseo?"; para 16+ es "¿Buena decisión o riesgo?". | 20 por acierto |
| **Memorama** | Unir cada concepto con su significado (para niñas y niños, dibujos iguales). | 300 menos 10 por movimiento extra |
| **Puerquito Ahorrador** | Mover la alcancía para atrapar monedas y billetes y esquivar trampas (antojos, gasto hormiga, deudas, fraudes, billetes falsos). Racha por atrapar seguido, estrella ×2, imán y la **Tarjeta FINABIEN**, que protege de la siguiente trampa. | Hasta 300 según el dinero atrapado |

### Conoce los servicios FINABIEN

| Juego | Cómo se juega |
|---|---|
| **El viaje de la remesa** | La Tarjeta FINABIEN cruza de EE. UU. a México en tres carriles: junta beneficios y esquiva cobros. |
| **Cosecha tu ahorro** | Cada ingreso va al colchón, a los antojos o al ahorro formal, y se ve cómo crece. |
| **Simulador del emprendedor** | Dilemas de un negocio que mueven las barras de bienestar financiero y salud del negocio. |
| **Maratón de pagos** | Pagar los recibos en la ventanilla FINABIEN antes de que caigan y no pagar los cobros falsos. |

Cada juego suma puntos en las primeras 2 partidas de cada jugador (`RETO_JUGADAS_CON_PUNTOS`); después es de práctica.

## Grupos de edad

Los mismos para todos los juegos:

| Grupo | Edad | Contenido |
|---|---|---|
| Exploradores | 10 años o menos | 3 opciones por pregunta, ahorro, necesidades y deseos. En el Puerquito: caída lenta, objetos grandes y trampas marcadas con un círculo rojo |
| Retadores | 11 a 15 años | Presupuesto, interés, inflación, seguridad digital |
| Expertos | 16 años o más | Crédito, CAT, AFORE, fraudes, remesas y servicios de FINABIEN. En el Puerquito: más velocidad, zigzag y billetes falsos sin marca |

Los rangos y las reglas de cada juego se ajustan en [config/reto.php](config/reto.php); los textos, cifras y mensajes de cierre en [config/reto_servicios.php](config/reto_servicios.php).

## Cómo funciona

- **Kiosco** (`/`): pantalla de juegos para tablet o PC con TV, con teclado en pantalla, botones grandes y regreso automático al inicio tras 90 s sin actividad. Las fuentes van incluidas en el build, así que no necesita internet en la sede.
- **API** (`/api/*`): sin sesión ni CSRF para que una pantalla encendida todo el día no caduque, con límites de peticiones por IP. Las respuestas correctas nunca se envían al navegador: el servidor califica cada respuesta y abona los puntos. En los arcade (remesa, cosecha, maratón y puerquito) el servidor genera la partida y recalcula los puntos con lo que reporta el kiosco.
- **Panel de staff** (`/staff`, protegido con `STAFF_PIN`): entregar premios por folio, existencias, preguntas de trivia, eventos y descarga CSV de jugadores y canjes.
- **Código de jugador**: 5 letras y números sin caracteres confusos (0/O, 1/I/L). Con él una persona sigue sumando en cualquier pantalla del stand.
- **Imágenes institucionales** (en `public/img`, se reemplazan sin tocar código): `fibi.png` (FIBI), `alcancia-sprite.png` (el marranito), `tarjeta-finabien.png` (Tarjeta FINABIEN, en la remesa, los cierres, los datos de FIBI y el Puerquito), logotipos y foto de sucursal.
- **Controles del Puerquito**: dedo o mouse sobre el escenario, flechas `←` `→` o `A` `D`, o un control de videojuegos.

## Instalación en Windows (`C:\Servidor\www`)

Requisitos: PHP 8.3 o más nuevo (con `pdo_mysql`, `mbstring`, `openssl` y `fileinfo`), Composer, MySQL 5.7+ o MariaDB 10.3+, y Apache con `mod_rewrite`. **No hace falta Node.js:** el front-end ya va compilado en `public/build`.

1. Crea la base de datos (si ya tenías la de Reto Finabien, `reto_bienestar`, puedes usar esa: sus jugadores, preguntas y premios se conservan):

   ```sql
   CREATE DATABASE reto_bienestar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Clona e instala:

   ```powershell
   cd C:\Servidor\www
   git clone https://github.com/armocte18-alt/Puerquito-Finabien.git puerquito-finabien
   cd puerquito-finabien
   composer install --no-dev --optimize-autoloader
   copy .env.example .env
   php artisan key:generate
   ```

3. En `.env` pon la contraseña de MySQL (`DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`), cambia `STAFF_PIN` y, en producción, `APP_ENV=production` y `APP_DEBUG=false`.

4. Crea las tablas y carga el contenido inicial (preguntas, tarjetas, memoramas, premios de ejemplo y un evento):

   ```powershell
   php artisan migrate --seed --force
   php artisan optimize
   ```

   Si la base ya tenía el contenido, usa solo `php artisan migrate --force`.

5. Para probar rápido sin configurar Apache: `php artisan serve` y abre `http://localhost:8000`.

### Apache

Se agrega en `Apache24\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
    ServerName reto-finabien.com
    ServerAlias www.reto-finabien.com reto-finabien.com.*.nip.io www.reto-finabien.com.*.nip.io
    DocumentRoot "C:/Servidor/www/puerquito-finabien/public"
    <Directory "C:/Servidor/www/puerquito-finabien/public">
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    ErrorLog "logs/reto-finabien-error.log"
    CustomLog "logs/reto-finabien-access.log" combined
</VirtualHost>
```

En `C:\Windows\System32\drivers\etc\hosts` (como administrador):

```
127.0.0.1   reto-finabien.com
127.0.0.1   www.reto-finabien.com
```

Reinicia el servicio **Apache2.4** como administrador. Si antes tenías un VirtualHost apuntando a `reto-bienestar`, cambia su ruta a `puerquito-finabien` en lugar de agregar otro.

### Tablets

Las tablets conectadas a la misma red entran con `http://www.reto-finabien.com.<IP>.nip.io`, donde `<IP>` es la dirección IPv4 del servidor (se ve con `ipconfig`). Por ejemplo, con la IP 172.20.10.5: `http://www.reto-finabien.com.172.20.10.5.nip.io`.

- El comodín `*.nip.io` del VirtualHost acepta cualquier IP, así que no hay que editar Apache al cambiar de red.
- nip.io necesita internet para resolver el nombre.
- Abrir solo la IP (`http://172.20.10.5`) muestra el primer sitio de Apache, no este.

### Actualizar

```powershell
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
```

## Antes de cada evento

1. `/staff/eventos`: crea el evento. Al activarlo, el ranking se reinicia para la nueva feria.
2. `/staff/premios`: ajusta costos y existencias reales.
3. `/staff/preguntas`: revisa las preguntas con tema FINABIEN (cifras de sucursales, requisitos de la Tarjeta Finabien, tarifas) con el área responsable.
4. Borra los datos de prueba si hiciste pruebas (ver abajo).
5. En el kiosco toca **Pantalla completa** (o F11) y deja la pantalla en el inicio.

## Borrar datos de prueba

```powershell
php artisan reto:limpiar             # todos los jugadores, con sus partidas y canjes (pide confirmación)
php artisan reto:limpiar --evento    # solo los del evento activo
php artisan reto:limpiar --force     # sin confirmación
```

Los premios canjeados vuelven a las existencias. Preguntas, premios y eventos no se tocan.

## Desarrollo

Si cambias algo en `resources/css` o `resources/js`, compila de nuevo y sube también `public/build`:

```bash
npm install
npm run build
```

## Pruebas

```bash
php artisan test
```

Cubren la asignación por edad, la calificación en el servidor (incluida la racha, la estrella y las trampas del Puerquito), el límite de partidas con puntos, la validación del memorama, el canje con existencias, la limpieza de datos de prueba y el acceso al panel con PIN.
