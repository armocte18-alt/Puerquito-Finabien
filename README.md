# Puerquito Ahorrador · Financiera para el Bienestar

Juego web en Laravel para aprender a ahorrar: el jugador mueve la alcancía para
atrapar monedas y billetes, esquivar trampas financieras y sumar puntos. Está
pensado para jugarse en una PC de escritorio o en una PC conectada a una TV o
proyector (todo escala a la pantalla y se lee a distancia).

## Rangos de edad

| Rango | Nombre | Duración | Vidas | Qué cambia |
|---|---|---|---|---|
| Hasta 8 años | Pequeños Ahorradores | 60 s | Sin límite | Caídas lentas, objetos grandes, zona de captura amplia, trampas marcadas con halo rojo |
| 9 a 15 años | Exploradores del Ahorro | 75 s | 3 | Más velocidad, billetes de $100/$200, deudas, algo de zigzag |
| 16 años o más | Expertos Financieros | 90 s | 3 | Velocidad alta, zigzag frecuente, fraudes y billetes falsos sin halo |

Todo el balance (velocidades, probabilidades, puntos, consejos) está en
[`config/juego.php`](config/juego.php); el front-end lo recibe como JSON, así
que se puede ajustar la dificultad sin tocar JavaScript.

## Objetos

- **Dinero** – monedas de $1, $2, $5, $10 y billetes de $20 a $500. Suman puntos
  y alimentan el **combo** (cada 5 atrapadas seguidas sube el multiplicador hasta ×3).
- **Trampas** – antojo, gasto hormiga, deuda, fraude y billete falso. Restan
  puntos, rompen el combo, quitan vida (en los rangos con vidas) y la primera
  vez muestran una lección de educación financiera.
- **Potenciadores** – estrella (puntos ×2), imán (atrae el dinero) y corazón (vida extra).

Al terminar se muestra el resumen (puntos, dinero ahorrado, estadísticas), un
consejo según la edad y la tabla de campeones de ese rango.

## Controles

- Ratón o pantalla táctil: la alcancía sigue al puntero.
- Teclado: `←` `→` o `A` `D`. `Enter` comienza, `P`/`Esc` pausa, `M` silencia, `F` pantalla completa.
- Gamepad: palanca o cruceta para moverse, `A` para confirmar, `Start` para pausar.
- En la portada: `1` `2` `3` eligen el rango directamente; flechas para navegar (útil con control remoto).

El juego se pausa solo si la ventana pierde el foco y respeta
`prefers-reduced-motion`.

## Instalación

Requisitos: PHP 8.3+ (con `pdo_mysql`, `mbstring`, `openssl` y `fileinfo`),
Composer y MySQL 5.7+ o MariaDB 10.3+.

1. Crea la base de datos:

   ```sql
   CREATE DATABASE puerquito CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Instala el proyecto:

   ```sh
   composer install
   cp .env.example .env        # en Windows: copy .env.example .env
   php artisan key:generate
   ```

3. Pon el usuario y la contraseña de MySQL en `.env` (`DB_USERNAME`, `DB_PASSWORD`) y crea las tablas:

   ```sh
   php artisan migrate
   php artisan serve
   ```

Abre `http://localhost:8000`. No hace falta compilar assets: el juego usa
JavaScript y CSS planos en `public/`.

Para usar SQLite en lugar de MySQL, pon `DB_CONNECTION=sqlite`, borra las demás
líneas `DB_*` y crea el archivo vacío `database/database.sqlite`.

## Estructura

| Archivo | Para qué |
|---|---|
| `config/juego.php` | Catálogo de objetos y parámetros por rango de edad |
| `app/Http/Controllers/JuegoController.php` | Portada y pantalla de juego |
| `app/Http/Controllers/PuntajeController.php` | Tabla de campeones y guardado de puntajes (JSON) |
| `app/Http/Requests/GuardarPuntajeRequest.php` | Validación y rechazo de puntajes imposibles |
| `resources/views/juego/*.blade.php` | Vistas |
| `public/js/juego.js` | Motor del juego (canvas, entrada, física, HUD) |
| `public/js/dibujo.js` | Dibujo vectorial de monedas, billetes, trampas y potenciadores |
| `public/js/sonido.js` | Efectos de sonido sintetizados con Web Audio |
| `public/img/alcancia-sprite.png` | Alcancía recortada a partir de la imagen oficial |

## Rutas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Portada y elección de edad |
| GET | `/jugar/{grupo}` | Juego (`pequenos`, `exploradores`, `expertos`) |
| GET | `/puntajes/{grupo}` | Top 10 del rango (JSON) |
| POST | `/puntajes` | Guarda una partida (CSRF, límite de 30 por minuto) |

## Borrar puntajes de prueba

```sh
php artisan puntajes:limpiar               # todos los rangos (pide confirmación)
php artisan puntajes:limpiar pequenos      # solo un rango: pequenos, exploradores o expertos
php artisan puntajes:limpiar --force       # sin confirmación
```

## Pruebas

```sh
php artisan test
```
